import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type Payload = Record<string, unknown>;

const FUNCTION_NAME = "project-neo-api";
const JSON_HEADERS = { "Content-Type": "application/json" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(?::\d{2})?$/;
const MAX_JSON_BYTES = 32_000;

const BOOKING_STATUSES = new Set([
  "new",
  "reviewing",
  "quoted",
  "deposit_requested",
  "confirmed",
  "completed",
  "cancelled",
]);

const BOOKING_STATUS_FLOW: Record<string, string[]> = {
  new: ["reviewing", "cancelled"],
  reviewing: ["quoted", "cancelled"],
  quoted: ["deposit_requested", "confirmed", "cancelled"],
  deposit_requested: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const BOOKING_EVENT_TYPES = new Set([
  "Wedding",
  "Prom or school event",
  "Nightlife or club event",
  "Private party",
  "Corporate event",
  "Restaurant or lounge",
  "Festival or concert",
  "Social or community event",
  "Community or social event",
  "Other",
]);

const BOOKING_SETUP_TYPES = new Set(["indoor", "outdoor", "both", "not_sure"]);

const BOOKING_BUDGET_RANGES = new Set([
  "Under $750",
  "$750-$1,200",
  "$1,200-$1,800",
  "$1,800-$2,500",
  "$1,500-$2,500",
  "$2,500+",
  "Not sure yet",
]);

const EVENT_STATUSES = new Set(["inquiry", "pending", "confirmed", "completed", "cancelled", "hold"]);
const LEGACY_EVENT_STATUSES = new Set(["tentative"]);
const EVENT_STATUS_ALIASES: Record<string, string> = {
  tentative: "pending",
};
const EVENT_VISIBILITIES = new Set(["public", "private"]);
const EVENT_SCHEDULING_STATUSES = new Set(["inquiry", "pending", "confirmed", "hold"]);
const EVENT_BLOCKING_STATUSES = new Set(["pending", "confirmed", "hold"]);
const INVOICE_STATUSES = new Set(["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"]);
const PAYMENT_STATUSES = new Set(["pending", "paid", "failed", "refunded"]);
const TASK_STATUSES = new Set(["todo", "in_progress", "waiting", "done", "cancelled"]);
const PAYMENT_TYPES = new Set(["deposit", "balance", "refund", "other"]);
const CLIENT_OPEN_EVENT_STATUSES = new Set(["pending", "confirmed", "hold", "tentative"]);
const ADMIN_ROLES = new Set(["owner", "admin"]);
const DEFAULT_AVAILABILITY_TIMEZONE = Deno.env.get("PROJECT_NEO_DEFAULT_TIMEZONE") || "America/Chicago";
const PUBLIC_AVAILABILITY_STATUSES = new Set(["available", "pending", "unavailable", "contact_required"]);
const AVAILABILITY_BLOCK_TYPES = new Set([
  "hold",
  "booked",
  "unavailable",
  "personal_block",
  "travel_block",
  "maintenance_day",
  "setup_day",
]);

const PUBLIC_AVAILABILITY_MESSAGES: Record<string, string> = {
  available: "This date appears available. Submit your inquiry to start the booking process.",
  pending: "This date may have another request pending. Submit your inquiry and we'll confirm availability.",
  unavailable: "This date is currently unavailable. You can still contact us about alternate times.",
  contact_required: "This date needs manual review. Submit your inquiry and we'll follow up.",
};

const UNAVAILABLE_BLOCK_TYPES = new Set(["booked", "personal_block", "travel_block", "unavailable"]);
const PENDING_BLOCK_TYPES = new Set(["hold"]);
const CONTACT_REQUIRED_BLOCK_TYPES = new Set(["maintenance_day", "setup_day"]);

const CARD_DATA_KEYS = new Set([
  "cardNumber",
  "card_number",
  "ccNumber",
  "cc_number",
  "cvv",
  "cvc",
  "securityCode",
  "security_code",
  "expirationDate",
  "expiration_date",
  "expiryDate",
  "expiry_date",
  "expMonth",
  "exp_month",
  "expYear",
  "exp_year",
  "cardExpiration",
  "card_expiration",
  "cardExpiry",
  "card_expiry",
  "cardExpMonth",
  "card_exp_month",
  "cardExpYear",
  "card_exp_year",
  "pan",
]);

class ApiError extends Error {
  status: number;
  code: string;
  details?: JsonValue;

  constructor(status: number, code: string, message: string, details?: JsonValue) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function corsHeaders(request: Request) {
  const configuredOrigin = Deno.env.get("PROJECT_NEO_ALLOWED_ORIGIN") || "*";
  const requestOrigin = request.headers.get("Origin") || "*";
  const allowOrigin = configuredOrigin === "*" ? requestOrigin : configuredOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(request: Request, status: number, body: JsonValue) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(request) },
  });
}

function ok(request: Request, data: JsonValue, status = 200) {
  return jsonResponse(request, status, { ok: true, data });
}

function fail(request: Request, error: unknown) {
  if (error instanceof ApiError) {
    return jsonResponse(request, error.status, {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
    });
  }

  console.error(error);
  return jsonResponse(request, 500, {
    ok: false,
    error: {
      code: "internal_error",
      message: "Something went wrong while processing the request.",
    },
  });
}

function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new ApiError(500, "missing_supabase_config", "Supabase environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function normalizePath(request: Request) {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
  if (pathname === `/${FUNCTION_NAME}`) return "/";
  if (pathname.startsWith(`/${FUNCTION_NAME}/`)) return pathname.slice(FUNCTION_NAME.length + 1);
  return pathname;
}

async function readJson(request: Request): Promise<Payload> {
  const rawBody = await request.text();

  if (!rawBody) return {};
  if (rawBody.length > MAX_JSON_BYTES) {
    throw new ApiError(413, "payload_too_large", "Request payload is too large.");
  }

  try {
    const parsed = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ApiError(400, "invalid_json", "Request body must be a JSON object.");
    }

    assertNoSensitiveCardData(parsed);
    return parsed as Payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  }
}

function assertNoSensitiveCardData(value: unknown, path = "") {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveCardData(item, `${path}[${index}]`));
    return;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (CARD_DATA_KEYS.has(key)) {
      throw new ApiError(400, "sensitive_payment_data_rejected", "Do not submit or store credit card data.", {
        field: path ? `${path}.${key}` : key,
      });
    }
    assertNoSensitiveCardData(item, path ? `${path}.${key}` : key);
  });
}

function cleanString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function requiredString(body: Payload, keys: string[], label: string, maxLength = 255) {
  const value = keys.map((key) => cleanString(body[key])).find(Boolean);
  if (!value) throw new ApiError(400, "validation_error", `${label} is required.`, { field: keys[0] });
  if (value.length > maxLength) {
    throw new ApiError(400, "validation_error", `${label} must be ${maxLength} characters or fewer.`, {
      field: keys[0],
    });
  }
  return value;
}

function optionalString(body: Payload, keys: string[], maxLength = 255) {
  const value = keys.map((key) => cleanString(body[key])).find(Boolean);
  if (!value) return null;
  if (value.length > maxLength) {
    throw new ApiError(400, "validation_error", `${keys[0]} must be ${maxLength} characters or fewer.`, {
      field: keys[0],
    });
  }
  return value;
}

function optionalHttpsUrl(body: Payload, keys: string[], label: string, maxLength = 2048) {
  const value = optionalString(body, keys, maxLength);
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error("Expected HTTPS.");
    return url.toString();
  } catch {
    throw new ApiError(400, "validation_error", `${label} must be a valid HTTPS URL.`, { field: keys[0] });
  }
}

function requiredEmail(body: Payload) {
  const email = requiredString(body, ["email"], "Email", 320).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new ApiError(400, "validation_error", "Email must be valid.", { field: "email" });
  }
  return email;
}

function optionalDate(body: Payload, keys: string[], label: string) {
  const value = optionalString(body, keys, 10);
  if (!value) return null;
  const parsedDate = new Date(`${value}T00:00:00Z`);
  if (
    !DATE_RE.test(value) || Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    throw new ApiError(400, "validation_error", `${label} must use YYYY-MM-DD format.`, { field: keys[0] });
  }
  return value;
}

function requiredDate(body: Payload, keys: string[], label: string) {
  const value = optionalDate(body, keys, label);
  if (!value) throw new ApiError(400, "validation_error", `${label} is required.`, { field: keys[0] });
  return value;
}

function optionalTime(body: Payload, keys: string[], label: string) {
  const value = optionalString(body, keys, 8);
  if (!value) return null;
  const [hours, minutes, seconds = 0] = value.split(":").map((part) => Number.parseInt(part, 10));
  if (!TIME_RE.test(value) || hours > 23 || minutes > 59 || seconds > 59) {
    throw new ApiError(400, "validation_error", `${label} must use HH:MM format.`, { field: keys[0] });
  }
  return value;
}

function optionalUuid(body: Payload, keys: string[], label: string) {
  const value = optionalString(body, keys, 36);
  if (!value) return null;
  if (!UUID_RE.test(value)) {
    throw new ApiError(400, "validation_error", `${label} must be a valid UUID.`, { field: keys[0] });
  }
  return value;
}

function requiredUuid(body: Payload, keys: string[], label: string) {
  const value = optionalUuid(body, keys, label);
  if (!value) throw new ApiError(400, "validation_error", `${label} is required.`, { field: keys[0] });
  return value;
}

function optionalPositiveInt(body: Payload, keys: string[], label: string) {
  const raw = keys.map((key) => body[key]).find((value) => value !== undefined && value !== null && value !== "");
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "string" && !/^\d+$/.test(raw.trim())) {
    throw new ApiError(400, "validation_error", `${label} must be a positive whole number.`, { field: keys[0] });
  }
  const value = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new ApiError(400, "validation_error", `${label} must be a positive whole number.`, { field: keys[0] });
  }
  return value;
}

function requiredPositiveInt(body: Payload, keys: string[], label: string) {
  const value = optionalPositiveInt(body, keys, label);
  if (value === null) throw new ApiError(400, "validation_error", `${label} is required.`, { field: keys[0] });
  return value;
}

function optionalNonnegativeInt(body: Payload, keys: string[], label: string) {
  const raw = keys.map((key) => body[key]).find((value) => value !== undefined && value !== null && value !== "");
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "string" && !/^\d+$/.test(raw.trim())) {
    throw new ApiError(400, "validation_error", `${label} must be zero or greater.`, { field: keys[0] });
  }
  const value = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);

  if (!Number.isInteger(value) || value < 0) {
    throw new ApiError(400, "validation_error", `${label} must be zero or greater.`, { field: keys[0] });
  }
  return value;
}

function optionalBoolean(body: Payload, keys: string[]) {
  const raw = keys.map((key) => body[key]).find((value) => value !== undefined && value !== null && value !== "");
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  throw new ApiError(400, "validation_error", `${keys[0]} must be true or false.`, { field: keys[0] });
}

function optionalEnum(body: Payload, keys: string[], allowed: Set<string>, label: string) {
  const value = optionalString(body, keys, 64);
  if (!value) return null;
  if (!allowed.has(value)) {
    throw new ApiError(400, "validation_error", `${label} is not supported.`, { field: keys[0], allowed: [...allowed] });
  }
  return value;
}

function requiredEnum(body: Payload, keys: string[], allowed: Set<string>, label: string) {
  const value = optionalEnum(body, keys, allowed, label);
  if (!value) throw new ApiError(400, "validation_error", `${label} is required.`, { field: keys[0] });
  return value;
}

function bookingNamePayload(body: Payload) {
  const legacyFullName = optionalString(body, ["clientName", "client_name", "client-name", "name", "fullName", "full_name"], 120);
  let firstName = optionalString(body, ["firstName", "first_name", "first-name"], 80);
  let lastName = optionalString(body, ["lastName", "last_name", "last-name"], 80);

  if (legacyFullName && (!firstName || !lastName)) {
    const [first, ...rest] = legacyFullName.split(/\s+/);
    firstName = firstName ?? first;
    lastName = lastName ?? (rest.length > 0 ? rest.join(" ") : null);
  }

  if (!firstName) {
    throw new ApiError(400, "validation_error", "Client name is required.", { field: "clientName" });
  }

  if (!lastName && !legacyFullName) {
    throw new ApiError(400, "validation_error", "Client name is required.", { field: "clientName" });
  }

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: legacyFullName ?? [firstName, lastName].filter(Boolean).join(" "),
  };
}

function adminLine(label: string, value: unknown) {
  if (value === null || value === undefined || value === "") return `${label}: Not provided`;
  return `${label}: ${value}`;
}

function composeBookingMessage(details: Record<string, unknown>) {
  return [
    adminLine("Event type", details.event_type),
    adminLine("Event date", details.event_date),
    adminLine("Start time", details.start_time),
    adminLine("End time", details.end_time),
    adminLine("Venue", details.venue_name),
    adminLine("Venue address", details.venue_address),
    adminLine("City/state", details.city_state),
    adminLine("Estimated guests", details.guest_count),
    adminLine("Setup", details.indoor_outdoor),
    adminLine("Music preferences", details.music_preferences),
    adminLine("Budget range", details.budget_range),
    adminLine("Referral source", details.heard_about),
    adminLine("Additional notes", details.additional_notes),
  ].join("\n");
}

function bookingStatusCanMove(fromStatus: string, toStatus: string) {
  return fromStatus === toStatus || (BOOKING_STATUS_FLOW[fromStatus] ?? []).includes(toStatus);
}

function hasAnyKey(body: Payload, keys: string[]) {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

function optionalIsoDateTime(body: Payload, keys: string[], label: string) {
  const value = optionalString(body, keys, 40);
  if (!value) return null;
  if (Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, "validation_error", `${label} must be a valid date or timestamp.`, { field: keys[0] });
  }
  return new Date(value).toISOString();
}

function numericLimit(url: URL, fallback: number, max: number) {
  const raw = url.searchParams.get("limit");
  if (!raw) return fallback;
  if (!/^\d+$/.test(raw)) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) return fallback;
  return Math.min(value, max);
}

function queryDate(url: URL, key: string, label: string) {
  const value = url.searchParams.get(key);
  if (!value) return null;
  const parsedDate = new Date(`${value}T00:00:00Z`);
  if (
    !DATE_RE.test(value) || Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    throw new ApiError(400, "validation_error", `${label} must use YYYY-MM-DD format.`, { field: key });
  }
  return value;
}

function queryStatus(url: URL, allowed: Set<string>, label: string) {
  const status = url.searchParams.get("status");
  if (!status || status === "all") return null;
  if (!allowed.has(status)) {
    throw new ApiError(400, "validation_error", `${label} is not supported.`, {
      field: "status",
      allowed: [...allowed],
    });
  }
  return status;
}

function normalizeEventStatus(status: string) {
  return EVENT_STATUS_ALIASES[status] ?? status;
}

function optionalEventStatus(body: Payload) {
  const value = optionalString(body, ["status"], 64);
  if (!value) return null;

  if (EVENT_STATUSES.has(value)) return value;
  if (LEGACY_EVENT_STATUSES.has(value)) return normalizeEventStatus(value);

  throw new ApiError(400, "validation_error", "Event status is not supported.", {
    field: "status",
    allowed: [...EVENT_STATUSES],
  });
}

function isBlockingEventStatus(status: unknown) {
  return EVENT_BLOCKING_STATUSES.has(normalizeEventStatus(String(status || "")));
}

function isScheduledEventStatus(status: unknown) {
  return EVENT_SCHEDULING_STATUSES.has(normalizeEventStatus(String(status || "")));
}

function minutesFromTime(value: unknown) {
  if (!value) return null;
  const [hours, minutes] = String(value).split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  return hours * 60 + minutes;
}

function eventTimesOverlap(
  startA: unknown,
  endA: unknown,
  startB: unknown,
  endB: unknown,
) {
  const aRange = timeRange(startA, endA);
  const bRange = timeRange(startB, endB);

  if (!aRange || !bRange) return true;

  return aRange.start < bRange.end && bRange.start < aRange.end;
}

function timeRange(startTime: unknown, endTime: unknown) {
  const start = minutesFromTime(startTime);
  let end = minutesFromTime(endTime);
  if (start === null || end === null) return null;
  if (end <= start) end += 24 * 60;
  return { start, end };
}

function publicAvailabilityResult(status: string, reasonCode?: string) {
  const safeStatus = PUBLIC_AVAILABILITY_STATUSES.has(status) ? status : "contact_required";
  const result: Record<string, string> = {
    status: safeStatus,
    message: PUBLIC_AVAILABILITY_MESSAGES[safeStatus] ?? PUBLIC_AVAILABILITY_MESSAGES.contact_required,
    checked_at: new Date().toISOString(),
  };

  if (reasonCode) result.reason_code = reasonCode;
  return result;
}

function submittedAvailabilitySnapshotFromBody(body: Payload) {
  const status = optionalString(body, [
    "availabilityStatusAtSubmission",
    "availability_status_at_submission",
    "availability-status-at-submission",
    "availabilityStatus",
    "availability_status",
  ], 32);

  if (!status || !PUBLIC_AVAILABILITY_STATUSES.has(status)) return null;

  const checkedAt = optionalString(body, [
    "availabilityCheckedAt",
    "availability_checked_at",
    "availability-checked-at",
    "availabilityCheckedAtSubmission",
    "availability_checked_at_submission",
  ], 80);
  const parsedCheckedAt = checkedAt ? Date.parse(checkedAt) : NaN;

  return {
    status,
    checked_at: Number.isNaN(parsedCheckedAt) ? new Date().toISOString() : new Date(parsedCheckedAt).toISOString(),
  };
}

function validateTimeZone(timezone: string) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return null;
  }
}

function timeZoneOffsetMs(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

function zonedDateTimeToUtcIso(eventDate: string, eventTime: string, timezone: string) {
  const [year, month, day] = eventDate.split("-").map((part) => Number.parseInt(part, 10));
  const [hour, minute, second = 0] = eventTime.split(":").map((part) => Number.parseInt(part, 10));
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const firstOffset = timeZoneOffsetMs(utcGuess, timezone);
  const firstUtc = new Date(utcGuess.getTime() - firstOffset);
  const secondOffset = timeZoneOffsetMs(firstUtc, timezone);

  return new Date(utcGuess.getTime() - secondOffset).toISOString();
}

function availabilityInputFromBody(body: Payload) {
  try {
    const eventDate = optionalDate(body, ["event_date", "eventDate", "event-date"], "Event date");
    const startTime = optionalTime(body, ["start_time", "startTime", "start-time"], "Start time");
    const endTime = optionalTime(body, ["end_time", "endTime", "end-time"], "End time");
    const eventType = optionalString(body, ["event_type", "eventType", "event-type"], 120);
    const timezoneInput = optionalString(body, ["timezone", "time_zone", "timeZone"], 80) ?? DEFAULT_AVAILABILITY_TIMEZONE;
    const timezone = validateTimeZone(timezoneInput);

    if (!eventDate || !startTime || !endTime) {
      return {
        ok: false,
        result: publicAvailabilityResult("contact_required", "incomplete_request"),
      };
    }

    if (!timezone) {
      return {
        ok: false,
        result: publicAvailabilityResult("contact_required", "invalid_timezone"),
      };
    }

    const startMinutes = minutesFromTime(startTime);
    const endMinutes = minutesFromTime(endTime);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return {
        ok: false,
        result: publicAvailabilityResult("contact_required", "unclear_time_range"),
      };
    }

    const startAt = zonedDateTimeToUtcIso(eventDate, startTime, timezone);
    const endAt = zonedDateTimeToUtcIso(eventDate, endTime, timezone);
    if (Date.parse(endAt) <= Date.parse(startAt)) {
      return {
        ok: false,
        result: publicAvailabilityResult("contact_required", "unclear_time_range"),
      };
    }

    return {
      ok: true,
      input: {
        eventDate,
        startTime,
        endTime,
        eventType,
        timezone,
        startAt,
        endAt,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.code === "validation_error") {
      return {
        ok: false,
        result: publicAvailabilityResult("contact_required", "invalid_request"),
      };
    }
    throw error;
  }
}

function eventConflictSummary(event: Record<string, unknown>) {
  const client = Array.isArray(event.clients) ? event.clients[0] : event.clients;

  return {
    id: String(event.id),
    title: String(event.title || "Event"),
    eventDate: String(event.event_date || ""),
    startTime: event.start_time ? String(event.start_time) : null,
    endTime: event.end_time ? String(event.end_time) : null,
    status: normalizeEventStatus(String(event.status || "pending")),
    clientName: client && typeof client === "object" ? String((client as Record<string, unknown>).full_name || "") : "",
  };
}

async function requireAdmin(request: Request, supabase: SupabaseClient) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    throw new ApiError(401, "unauthorized", "Admin authorization is required.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new ApiError(401, "unauthorized", "Admin authorization is invalid.");
  }

  const { data: projectNeoUser, error: adminError } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (adminError) {
    throw new ApiError(500, "admin_lookup_failed", "Could not verify admin access.", adminError.message);
  }

  if (!projectNeoUser || !projectNeoUser.is_active || !ADMIN_ROLES.has(String(projectNeoUser.role))) {
    throw new ApiError(403, "forbidden", "This account does not have Project Neo admin access.");
  }

  return {
    authUser: userData.user,
    projectNeoUser,
  };
}

async function requirePortalClient(request: Request, supabase: SupabaseClient) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    throw new ApiError(401, "unauthorized", "Client portal authorization is required.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new ApiError(401, "unauthorized", "Client portal authorization is invalid.");
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(`
      id,
      portal_user_id,
      full_name,
      email,
      phone,
      company_name,
      preferred_contact_method
    `)
    .eq("portal_user_id", userData.user.id)
    .maybeSingle();

  if (clientError) {
    throw new ApiError(500, "client_lookup_failed", "Could not verify client portal access.", clientError.message);
  }

  if (!client) {
    throw new ApiError(403, "forbidden", "This account is not connected to a DJ Too Kold client portal.");
  }

  return {
    authUser: userData.user,
    client,
  };
}

function bookingInquiryPayload(body: Payload) {
  const name = bookingNamePayload(body);
  const eventType = requiredEnum(body, ["eventType", "event_type", "event-type"], BOOKING_EVENT_TYPES, "Event type");
  const eventDate = requiredDate(body, ["eventDate", "event_date", "event-date"], "Event date");
  const cityState = requiredString(body, ["cityState", "city_state", "city-state", "location"], "City/state", 160);
  const venueName = optionalString(body, ["venueName", "venue_name", "venue-name"], 180);
  const venueAddress = optionalString(body, ["venueAddress", "venue_address", "venue-address"], 220);
  const startTime = optionalTime(body, ["startTime", "start_time", "start-time"], "Start time");
  const endTime = optionalTime(body, ["endTime", "end_time", "end-time"], "End time");
  const guestCount = requiredPositiveInt(body, ["guestCount", "guest_count", "guest-count"], "Guest count");
  const indoorOutdoor = optionalEnum(body, ["indoorOutdoor", "indoor_outdoor", "indoor-outdoor"], BOOKING_SETUP_TYPES, "Indoor/outdoor");
  const musicPreferences = optionalString(body, ["musicPreferences", "music_preferences", "music-preferences"], 1200);
  const budgetRange = optionalEnum(body, ["budgetRange", "budget_range", "budget-range"], BOOKING_BUDGET_RANGES, "Budget range");
  const heardAbout = optionalString(body, ["heardAbout", "heard_about", "heard-about"], 180);
  const additionalNotes = optionalString(body, ["additionalNotes", "additional_notes", "additional-notes", "message"], 2000);
  const location = optionalString(body, ["location"], 220) ?? [venueName, cityState].filter(Boolean).join(" / ");
  const details = {
    event_type: eventType,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    venue_name: venueName,
    venue_address: venueAddress,
    city_state: cityState,
    guest_count: guestCount,
    indoor_outdoor: indoorOutdoor,
    music_preferences: musicPreferences,
    budget_range: budgetRange,
    heard_about: heardAbout,
    additional_notes: additionalNotes,
  };

  return {
    ...name,
    email: requiredEmail(body),
    phone: optionalString(body, ["phone"], 40),
    subject: optionalString(body, ["subject"], 180) ?? "Booking request from website",
    message: optionalString(body, ["message"], 4000) ?? composeBookingMessage(details),
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    event_type: eventType,
    venue_name: venueName,
    venue_address: venueAddress,
    city_state: cityState,
    location,
    guest_count: guestCount,
    indoor_outdoor: indoorOutdoor,
    music_preferences: musicPreferences,
    budget_range: budgetRange,
    heard_about: heardAbout,
    additional_notes: additionalNotes,
    source: optionalString(body, ["source"], 80) ?? "website",
  };
}

function contactMessagePayload(body: Payload) {
  return {
    full_name: requiredString(body, ["name", "fullName", "full_name"], "Name", 120),
    email: requiredEmail(body),
    subject: optionalString(body, ["subject"], 180) ?? "Contact from website",
    message: requiredString(body, ["message"], "Message", 4000),
  };
}

function clientPayload(body: Payload) {
  return {
    full_name: requiredString(body, ["fullName", "full_name", "name"], "Client name", 120),
    email: requiredEmail(body),
    phone: optionalString(body, ["phone"], 40),
    notes: optionalString(body, ["notes"], 4000),
  };
}

function eventPayload(body: Payload) {
  const isPublic = optionalBoolean(body, ["isPublic", "is_public", "public"]);
  const visibility = optionalEnum(
    body,
    ["visibility", "publicPrivateVisibility", "public_private_visibility"],
    EVENT_VISIBILITIES,
    "Event visibility",
  ) ?? (isPublic === null ? "private" : isPublic ? "public" : "private");

  return {
    client_id: optionalUuid(body, ["clientId", "client_id"], "Client ID"),
    booking_inquiry_id: optionalUuid(body, ["bookingInquiryId", "booking_inquiry_id"], "Booking inquiry ID"),
    venue_id: optionalUuid(body, ["venueId", "venue_id"], "Venue ID"),
    package_id: optionalUuid(body, ["packageId", "package_id"], "Package ID"),
    title: requiredString(body, ["title"], "Event title", 180),
    event_type: optionalString(body, ["eventType", "event_type"], 120),
    event_date: requiredDate(body, ["eventDate", "event_date"], "Event date"),
    start_time: optionalTime(body, ["startTime", "start_time"], "Start time"),
    end_time: optionalTime(body, ["endTime", "end_time"], "End time"),
    venue_name: optionalString(body, ["venueName", "venue_name"], 180),
    location: optionalString(body, ["location"], 220),
    guest_count: optionalPositiveInt(body, ["guestCount", "guest_count"], "Guest count"),
    status: optionalEventStatus(body) ?? "pending",
    visibility,
    notes: optionalString(body, ["notes"], 4000),
    internal_notes: optionalString(body, ["internalNotes", "internal_notes"], 4000),
    setup_notes: optionalString(body, ["setupNotes", "setup_notes"], 4000),
    timeline_notes: optionalString(body, ["timelineNotes", "timeline_notes"], 4000),
    calendar_sync_id: optionalString(body, ["calendarSyncId", "calendar_sync_id"], 255),
  };
}

function availabilityStatusForBlockType(blockType: string) {
  if (blockType === "hold") return "pending";
  if (blockType === "maintenance_day" || blockType === "setup_day") return "contact_required";
  return "unavailable";
}

function availabilityBlockPayload(body: Payload, adminUserId: string) {
  const blockType = requiredEnum(
    body,
    ["blockType", "block_type", "type"],
    AVAILABILITY_BLOCK_TYPES,
    "Availability block type",
  );
  const startAt = optionalIsoDateTime(body, ["startAt", "start_at"], "Start date/time");
  const endAt = optionalIsoDateTime(body, ["endAt", "end_at"], "End date/time");
  if (!startAt) throw new ApiError(400, "validation_error", "Start date/time is required.", { field: "startAt" });
  if (!endAt) throw new ApiError(400, "validation_error", "End date/time is required.", { field: "endAt" });
  if (Date.parse(endAt) <= Date.parse(startAt)) {
    throw new ApiError(400, "validation_error", "End date/time must be after start date/time.", { field: "endAt" });
  }

  return {
    title: requiredString(body, ["title"], "Title", 180),
    block_type: blockType,
    status: availabilityStatusForBlockType(blockType),
    start_at: startAt,
    end_at: endAt,
    all_day: optionalBoolean(body, ["allDay", "all_day"]) ?? false,
    public_message: optionalString(body, ["publicMessage", "public_message"], 500),
    internal_notes: optionalString(body, ["internalNotes", "internal_notes"], 4000),
    created_by: adminUserId,
  };
}

function invoicePayload(body: Payload) {
  const subtotal = optionalNonnegativeInt(body, ["subtotalCents", "subtotal_cents"], "Subtotal cents") ?? 0;
  const discount = optionalNonnegativeInt(body, ["discountCents", "discount_cents"], "Discount cents") ?? 0;
  const tax = optionalNonnegativeInt(body, ["taxCents", "tax_cents"], "Tax cents") ?? 0;
  const calculatedTotal = subtotal - discount + tax;
  if (calculatedTotal < 0) {
    throw new ApiError(400, "validation_error", "Invoice discount cannot exceed subtotal plus tax.", {
      field: "discountCents",
    });
  }
  const total = optionalNonnegativeInt(body, ["totalCents", "total_cents"], "Total cents") ?? calculatedTotal;
  if (total !== calculatedTotal) {
    throw new ApiError(400, "validation_error", "Invoice total must equal subtotal minus discount plus tax.", {
      field: "totalCents",
    });
  }
  const deposit = optionalNonnegativeInt(body, ["depositCents", "deposit_cents"], "Deposit cents") ?? 0;
  if (deposit > total) {
    throw new ApiError(400, "validation_error", "Deposit cannot exceed invoice total.", { field: "depositCents" });
  }
  const paymentProvider = optionalString(body, ["paymentProvider", "payment_provider"], 80);
  const paymentLinkUrl = optionalHttpsUrl(
    body,
    ["paymentLinkUrl", "payment_link_url", "hostedPaymentUrl", "hosted_payment_url"],
    "Payment link URL",
  );
  const externalInvoiceId = optionalString(body, ["externalInvoiceId", "external_invoice_id"], 160);
  const externalInvoiceUrl = optionalHttpsUrl(body, ["externalInvoiceUrl", "external_invoice_url"], "External invoice URL");

  if ((paymentLinkUrl || externalInvoiceId || externalInvoiceUrl) && !paymentProvider) {
    throw new ApiError(400, "validation_error", "Payment provider is required when hosted payment details are supplied.", {
      field: "paymentProvider",
    });
  }

  return {
    client_id: optionalUuid(body, ["clientId", "client_id"], "Client ID"),
    event_id: optionalUuid(body, ["eventId", "event_id"], "Event ID"),
    invoice_number: requiredString(body, ["invoiceNumber", "invoice_number"], "Invoice number", 80),
    status: optionalEnum(body, ["status"], INVOICE_STATUSES, "Invoice status") ?? "draft",
    currency: (optionalString(body, ["currency"], 8) ?? "USD").toUpperCase(),
    payment_provider: paymentProvider,
    payment_link_url: paymentLinkUrl,
    payment_link_expires_at: optionalIsoDateTime(
      body,
      ["paymentLinkExpiresAt", "payment_link_expires_at"],
      "Payment link expiration",
    ),
    external_invoice_id: externalInvoiceId,
    external_invoice_url: externalInvoiceUrl,
    subtotal_cents: subtotal,
    discount_cents: discount,
    tax_cents: tax,
    deposit_cents: deposit,
    total_cents: total,
    due_date: optionalDate(body, ["dueDate", "due_date"], "Due date"),
    notes: optionalString(body, ["notes"], 4000),
    terms: optionalString(body, ["terms"], 4000),
  };
}

function paymentPayload(body: Payload) {
  const status = optionalEnum(body, ["status"], PAYMENT_STATUSES, "Payment status") ?? "pending";
  const paymentDate = optionalDate(body, ["paymentDate", "payment_date"], "Payment date");
  const paidAt = optionalIsoDateTime(body, ["paidAt", "paid_at"], "Paid at");
  const refundedAt = optionalIsoDateTime(body, ["refundedAt", "refunded_at"], "Refunded at");
  const paymentProvider = optionalString(body, ["paymentProvider", "payment_provider"], 80);
  const providerPaymentId = optionalString(
    body,
    ["providerPaymentId", "provider_payment_id", "externalPaymentReference", "external_payment_reference"],
    160,
  );
  const resolvedPaidAt = paidAt ?? (status === "paid" ? `${paymentDate ?? new Date().toISOString().slice(0, 10)}T00:00:00Z` : null);
  const resolvedRefundedAt = refundedAt ??
    (status === "refunded" ? `${paymentDate ?? new Date().toISOString().slice(0, 10)}T00:00:00Z` : null);

  if (providerPaymentId && !paymentProvider) {
    throw new ApiError(400, "validation_error", "Payment provider is required when an external payment reference is supplied.", {
      field: "paymentProvider",
    });
  }

  return {
    invoice_id: requiredUuid(body, ["invoiceId", "invoice_id"], "Invoice ID"),
    status,
    amount_cents: requiredPositiveInt(body, ["amountCents", "amount_cents"], "Amount cents"),
    currency: (optionalString(body, ["currency"], 8) ?? "USD").toUpperCase(),
    payment_type: optionalEnum(body, ["paymentType", "payment_type"], PAYMENT_TYPES, "Payment type") ?? "deposit",
    payment_provider: paymentProvider,
    provider_payment_id: providerPaymentId,
    payment_date: paymentDate ?? resolvedPaidAt?.slice(0, 10) ?? resolvedRefundedAt?.slice(0, 10) ?? null,
    paid_at: resolvedPaidAt,
    refunded_at: resolvedRefundedAt,
    notes: optionalString(body, ["notes"], 4000),
  };
}

function paymentStatusPayload(body: Payload) {
  const status = requiredEnum(body, ["status"], PAYMENT_STATUSES, "Payment status");
  const paymentDate = optionalDate(body, ["paymentDate", "payment_date"], "Payment date");
  const update: Record<string, string | null> = {
    status,
  };

  if (hasAnyKey(body, ["paymentDate", "payment_date"])) {
    update.payment_date = paymentDate;
  }

  if (hasAnyKey(body, ["paidAt", "paid_at"])) {
    update.paid_at = optionalIsoDateTime(body, ["paidAt", "paid_at"], "Paid at");
  } else if (status === "paid") {
    update.paid_at = `${paymentDate ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  }

  if (hasAnyKey(body, ["refundedAt", "refunded_at"])) {
    update.refunded_at = optionalIsoDateTime(body, ["refundedAt", "refunded_at"], "Refunded at");
  } else if (status === "refunded") {
    update.refunded_at = `${paymentDate ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  }

  if (hasAnyKey(body, ["notes"])) {
    update.notes = optionalString(body, ["notes"], 4000);
  }

  return update;
}

function songRequestCreatePayload(body: Payload) {
  return {
    event_id: requiredUuid(body, ["eventId", "event_id"], "Event ID"),
    requested_by_name: optionalString(body, ["requestedByName", "requested_by_name"], 120),
    requested_by_email: optionalString(body, ["requestedByEmail", "requested_by_email"], 320),
    song_title: requiredString(body, ["songTitle", "song_title"], "Song title", 180),
    artist: optionalString(body, ["artist"], 180),
    notes: optionalString(body, ["notes"], 1000),
    dedication: optionalString(body, ["dedication"], 500),
    is_must_play: optionalBoolean(body, ["isMustPlay", "is_must_play"]) ?? false,
    status: "requested",
  };
}

function songRequestUpdatePayload(body: Payload) {
  const update: Record<string, string | boolean | null> = {};

  if (hasAnyKey(body, ["songTitle", "song_title"])) {
    update.song_title = requiredString(body, ["songTitle", "song_title"], "Song title", 180);
  }
  if (hasAnyKey(body, ["artist"])) {
    update.artist = optionalString(body, ["artist"], 180);
  }
  if (hasAnyKey(body, ["notes"])) {
    update.notes = optionalString(body, ["notes"], 1000);
  }
  if (hasAnyKey(body, ["dedication"])) {
    update.dedication = optionalString(body, ["dedication"], 500);
  }
  if (hasAnyKey(body, ["isMustPlay", "is_must_play"])) {
    update.is_must_play = optionalBoolean(body, ["isMustPlay", "is_must_play"]) ?? false;
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "validation_error", "At least one song request field is required.");
  }

  return update;
}

function eventNoteUpdatePayload(body: Payload) {
  return {
    body: requiredString(body, ["body", "notes", "preferences"], "Note", 4000),
  };
}

async function validatePaymentAgainstInvoice(supabase: SupabaseClient, payment: ReturnType<typeof paymentPayload>) {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, status, currency, total_cents, deposit_cents, deposit_paid_cents, balance_due_cents, amount_paid_cents")
    .eq("id", payment.invoice_id)
    .single();

  if (error) throw new ApiError(404, "invoice_not_found", "Invoice was not found.", error.message);
  if (invoice.status === "cancelled") {
    throw new ApiError(409, "invoice_cancelled", "Payments cannot be recorded against a cancelled invoice.", {
      invoiceId: payment.invoice_id,
    });
  }
  if (String(invoice.currency).toUpperCase() !== payment.currency) {
    throw new ApiError(400, "validation_error", "Payment currency must match the invoice currency.", {
      field: "currency",
      invoiceCurrency: invoice.currency,
    });
  }

  const amountCents = Number(payment.amount_cents);
  const balanceDueCents = Number(invoice.balance_due_cents ?? invoice.total_cents ?? 0);
  const amountPaidCents = Number(invoice.amount_paid_cents ?? 0);
  const depositRemainingCents = Math.max(
    Number(invoice.deposit_cents ?? 0) - Number(invoice.deposit_paid_cents ?? 0),
    0,
  );
  const isRefundLike = payment.payment_type === "refund" || payment.status === "refunded";

  if (isRefundLike) {
    if (amountCents > amountPaidCents) {
      throw new ApiError(400, "validation_error", "Refund amount cannot exceed the amount already paid.", {
        field: "amountCents",
        amountPaidCents,
      });
    }
    return;
  }

  if (payment.status === "failed") return;

  if (payment.payment_type === "deposit" && amountCents > depositRemainingCents) {
    throw new ApiError(400, "validation_error", "Deposit payment cannot exceed the remaining deposit amount.", {
      field: "amountCents",
      depositRemainingCents,
    });
  }

  if (payment.payment_type !== "deposit" && amountCents > balanceDueCents) {
    throw new ApiError(400, "validation_error", "Payment amount cannot exceed the invoice balance due.", {
      field: "amountCents",
      balanceDueCents,
    });
  }
}

async function submitBookingInquiry(request: Request, supabase: SupabaseClient) {
  const body = await readJson(request);
  const payload = bookingInquiryPayload(body);
  const availabilitySnapshot = await availabilitySnapshotForBooking(supabase, body);
  const { data, error } = await supabase
    .from("booking_inquiries")
    .insert({ ...payload, ...availabilitySnapshot })
    .select("id, status, availability_status_at_submission, availability_checked_at, created_at")
    .single();

  if (error) throw new ApiError(500, "booking_inquiry_create_failed", "Could not submit booking inquiry.", error.message);
  return ok(request, data, 201);
}

async function submitContactMessage(request: Request, supabase: SupabaseClient) {
  const payload = contactMessagePayload(await readJson(request));
  const { data, error } = await supabase
    .from("contact_messages")
    .insert(payload)
    .select("id, status, created_at")
    .single();

  if (error) throw new ApiError(500, "contact_message_create_failed", "Could not submit contact message.", error.message);
  return ok(request, data, 201);
}

async function fetchMediaRecords(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 24, 100);
  const { data, error } = await supabase
    .from("gallery_items")
    .select(`
      id,
      title,
      description,
      caption,
      media_type,
      media_category,
      file_url:url,
      url,
      thumbnail_url,
      alt_text,
      event_date,
      venue,
      tags,
      source_type,
      storage_bucket,
      storage_path,
      external_url,
      embed_url,
      provider,
      display_order:sort_order,
      sort_order,
      is_featured
    `)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "media_fetch_failed", "Could not fetch media records.", error.message);
  return ok(request, data ?? []);
}

async function fetchMixRecords(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 12, 50);
  const { data, error } = await supabase
    .from("mixes")
    .select(`
      id,
      title,
      slug,
      description,
      platform,
      file_url:audio_url,
      audio_url,
      embed_url,
      cover_image_url,
      thumbnail_url:cover_image_url,
      duration_seconds,
      recorded_at,
      display_order:sort_order,
      sort_order,
      is_featured
    `)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "mixes_fetch_failed", "Could not fetch mix records.", error.message);
  return ok(request, data ?? []);
}

async function fetchServicePackages(request: Request, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("packages")
    .select("id, name, slug, description, price_starting_cents:price_cents, duration_minutes, features, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new ApiError(500, "packages_fetch_failed", "Could not fetch service packages.", error.message);
  return ok(request, data ?? []);
}

function portalClientResponse(portal: Awaited<ReturnType<typeof requirePortalClient>>) {
  return {
    id: portal.client.id,
    fullName: portal.client.full_name,
    email: portal.client.email,
    phone: portal.client.phone,
    companyName: portal.client.company_name,
    preferredContactMethod: portal.client.preferred_contact_method,
    authEmail: portal.authUser.email ?? null,
  };
}

async function fetchPortalProfile(request: Request, portal: Awaited<ReturnType<typeof requirePortalClient>>) {
  return ok(request, { client: portalClientResponse(portal) });
}

async function fetchPortalSummary(
  request: Request,
  supabase: SupabaseClient,
  portal: Awaited<ReturnType<typeof requirePortalClient>>,
) {
  const clientId = String(portal.client.id);
  await markOverdueInvoices(supabase, clientId);

  const [eventsResult, invoicesResult, contractsResult] = await Promise.all([
    supabase
      .from("events")
      .select(`
        id,
        title,
        event_type,
        event_date,
        start_time,
        end_time,
        timezone,
        venue_id,
        venue_name,
        location,
        guest_count,
        status,
        setup_notes,
        timeline_notes,
        created_at,
        updated_at,
        venues(
          id,
          name,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          website_url,
          contact_name,
          contact_email,
          contact_phone,
          load_in_notes,
          parking_notes,
          power_notes
        )
      `)
      .eq("client_id", clientId)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: false }),
    supabase
      .from("invoices")
      .select(`
        id,
        event_id,
        invoice_number,
        status,
        currency,
        issue_date,
        due_date,
        sent_at,
        paid_at,
        payment_provider,
        payment_link_url,
        payment_link_expires_at,
        external_invoice_url,
        subtotal_cents,
        discount_cents,
        tax_cents,
        deposit_cents,
        deposit_paid_cents,
        amount_paid_cents,
        balance_due_cents,
        total_cents,
        notes,
        terms,
        invoice_items(
          id,
          description,
          quantity,
          unit_price_cents,
          line_total_cents,
          sort_order
        ),
        payments(
          id,
          status,
          amount_cents,
          currency,
          payment_type,
          payment_provider,
          payment_date,
          paid_at,
          refunded_at
        )
      `)
      .eq("client_id", clientId)
      .neq("status", "draft")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("contracts")
      .select(`
        id,
        event_id,
        contract_number,
        status,
        title,
        document_url,
        sent_at,
        signed_at,
        expires_at,
        cancelled_at,
        created_at,
        updated_at
      `)
      .eq("client_id", clientId)
      .neq("status", "draft")
      .order("created_at", { ascending: false }),
  ]);

  const failures = [eventsResult, invoicesResult, contractsResult]
    .map((result) => result.error?.message)
    .filter(Boolean);
  if (failures.length > 0) {
    throw new ApiError(500, "portal_summary_fetch_failed", "Could not fetch client portal records.", failures.join("; "));
  }

  const events = eventsResult.data ?? [];
  const eventIds = events.map((event) => String(event.id));
  let notes: JsonValue[] = [];
  let songRequests: JsonValue[] = [];

  if (eventIds.length > 0) {
    const [notesResult, songRequestsResult] = await Promise.all([
      supabase
        .from("event_notes")
        .select("id, event_id, note_type, body, is_private, client_editable, created_at, updated_at")
        .in("event_id", eventIds)
        .eq("is_private", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("song_requests")
        .select(`
          id,
          event_id,
          requested_by_name,
          requested_by_email,
          song_title,
          artist,
          notes,
          dedication,
          is_must_play,
          status,
          sort_order,
          created_at,
          updated_at
        `)
        .in("event_id", eventIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    const portalFailures = [notesResult, songRequestsResult]
      .map((result) => result.error?.message)
      .filter(Boolean);
    if (portalFailures.length > 0) {
      throw new ApiError(500, "portal_details_fetch_failed", "Could not fetch client portal details.", portalFailures.join("; "));
    }

    notes = (notesResult.data ?? []) as JsonValue[];
    songRequests = (songRequestsResult.data ?? []) as JsonValue[];
  }

  return ok(request, {
    client: portalClientResponse(portal),
    events,
    invoices: invoicesResult.data ?? [],
    contracts: contractsResult.data ?? [],
    notes,
    songRequests,
  });
}

async function fetchClientEventForWrite(supabase: SupabaseClient, eventId: string, clientId: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, status, event_date")
    .eq("id", eventId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw new ApiError(500, "event_lookup_failed", "Could not verify event ownership.", error.message);
  if (!event) throw new ApiError(404, "event_not_found", "Event was not found for this portal account.");
  if (!CLIENT_OPEN_EVENT_STATUSES.has(String(event.status))) {
    throw new ApiError(409, "event_not_open", "This event is not open for client portal changes.");
  }

  return event;
}

async function createPortalSongRequest(
  request: Request,
  supabase: SupabaseClient,
  portal: Awaited<ReturnType<typeof requirePortalClient>>,
) {
  const payload = songRequestCreatePayload(await readJson(request));
  await fetchClientEventForWrite(supabase, payload.event_id, String(portal.client.id));

  const requestedByEmail = payload.requested_by_email
    ? String(payload.requested_by_email).toLowerCase()
    : String(portal.client.email);
  if (requestedByEmail && !EMAIL_RE.test(requestedByEmail)) {
    throw new ApiError(400, "validation_error", "Requested by email must be valid.", { field: "requestedByEmail" });
  }

  const insertPayload = {
    ...payload,
    requested_by_name: payload.requested_by_name ?? portal.client.full_name,
    requested_by_email: requestedByEmail || null,
  };

  const { data, error } = await supabase
    .from("song_requests")
    .insert(insertPayload)
    .select(`
      id,
      event_id,
      requested_by_name,
      requested_by_email,
      song_title,
      artist,
      notes,
      dedication,
      is_must_play,
      status,
      sort_order,
      created_at,
      updated_at
    `)
    .single();

  if (error) throw new ApiError(500, "song_request_create_failed", "Could not save song request.", error.message);
  return ok(request, data, 201);
}

async function updatePortalSongRequest(
  request: Request,
  supabase: SupabaseClient,
  portal: Awaited<ReturnType<typeof requirePortalClient>>,
  songRequestId: string,
) {
  const payload = songRequestUpdatePayload(await readJson(request));
  const { data: currentSong, error: currentError } = await supabase
    .from("song_requests")
    .select("id, event_id, status")
    .eq("id", songRequestId)
    .maybeSingle();

  if (currentError) {
    throw new ApiError(500, "song_request_lookup_failed", "Could not verify song request ownership.", currentError.message);
  }
  if (!currentSong) throw new ApiError(404, "song_request_not_found", "Song request was not found.");
  if (currentSong.status !== "requested") {
    throw new ApiError(409, "song_request_locked", "Only requested songs can be edited from the client portal.");
  }

  await fetchClientEventForWrite(supabase, String(currentSong.event_id), String(portal.client.id));

  const { data, error } = await supabase
    .from("song_requests")
    .update(payload)
    .eq("id", songRequestId)
    .select(`
      id,
      event_id,
      requested_by_name,
      requested_by_email,
      song_title,
      artist,
      notes,
      dedication,
      is_must_play,
      status,
      sort_order,
      created_at,
      updated_at
    `)
    .single();

  if (error) throw new ApiError(500, "song_request_update_failed", "Could not update song request.", error.message);
  return ok(request, data);
}

async function updatePortalEventNote(
  request: Request,
  supabase: SupabaseClient,
  portal: Awaited<ReturnType<typeof requirePortalClient>>,
  eventNoteId: string,
) {
  const payload = eventNoteUpdatePayload(await readJson(request));
  const { data: currentNote, error: currentError } = await supabase
    .from("event_notes")
    .select("id, event_id, is_private, client_editable")
    .eq("id", eventNoteId)
    .maybeSingle();

  if (currentError) {
    throw new ApiError(500, "event_note_lookup_failed", "Could not verify event note ownership.", currentError.message);
  }
  if (!currentNote) throw new ApiError(404, "event_note_not_found", "Event note was not found.");
  if (currentNote.is_private || !currentNote.client_editable) {
    throw new ApiError(403, "event_note_locked", "This event note is not open for client edits.");
  }

  await fetchClientEventForWrite(supabase, String(currentNote.event_id), String(portal.client.id));

  const { data, error } = await supabase
    .from("event_notes")
    .update(payload)
    .eq("id", eventNoteId)
    .select("id, event_id, note_type, body, is_private, client_editable, created_at, updated_at")
    .single();

  if (error) throw new ApiError(500, "event_note_update_failed", "Could not update event note.", error.message);
  return ok(request, data);
}

async function createClientRecord(request: Request, supabase: SupabaseClient) {
  const payload = clientPayload(await readJson(request));
  const { data, error } = await supabase.from("clients").insert(payload).select("*").single();

  if (error) throw new ApiError(500, "client_create_failed", "Could not create client record.", error.message);
  return ok(request, data, 201);
}

async function fetchAdminClients(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const { data, error } = await supabase
    .from("clients")
    .select(`
      id,
      full_name,
      email,
      phone,
      company_name,
      preferred_contact_method,
      city,
      state,
      notes,
      created_at,
      updated_at
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "clients_fetch_failed", "Could not fetch client records.", error.message);
  return ok(request, data ?? []);
}

async function fetchAdminProfile(request: Request, admin: Awaited<ReturnType<typeof requireAdmin>>) {
  return ok(request, {
    id: admin.authUser.id,
    email: admin.authUser.email ?? null,
    role: admin.projectNeoUser.role,
    isActive: admin.projectNeoUser.is_active,
  });
}

async function findEventConflicts(
  supabase: SupabaseClient,
  event: Record<string, unknown>,
  ignoreEventId?: string,
) {
  if (!event.event_date || !isScheduledEventStatus(event.status)) return [];

  let query = supabase
    .from("events")
    .select(`
      id,
      title,
      event_date,
      start_time,
      end_time,
      status,
      clients(id, full_name)
    `)
    .eq("event_date", String(event.event_date))
    .in("status", [...EVENT_BLOCKING_STATUSES]);

  if (ignoreEventId) query = query.neq("id", ignoreEventId);

  const { data, error } = await query;
  if (error) throw new ApiError(500, "event_conflict_check_failed", "Could not check event conflicts.", error.message);

  return (data ?? [])
    .filter((candidate) => eventTimesOverlap(event.start_time, event.end_time, candidate.start_time, candidate.end_time))
    .map((candidate) => eventConflictSummary(candidate as Record<string, unknown>));
}

function annotateEventConflicts(events: Record<string, unknown>[]) {
  return events.map((event) => {
    const normalizedEvent = {
      ...event,
      status: normalizeEventStatus(String(event.status || "pending")),
    };

    const conflicts = events
      .filter((candidate) => {
        if (candidate.id === event.id) return false;
        if (candidate.event_date !== event.event_date) return false;
        if (!isScheduledEventStatus(event.status)) return false;
        if (!isBlockingEventStatus(candidate.status)) return false;
        return eventTimesOverlap(event.start_time, event.end_time, candidate.start_time, candidate.end_time);
      })
      .map(eventConflictSummary);

    return {
      ...normalizedEvent,
      conflict_warnings: conflicts,
    };
  });
}

async function createEventRecord(request: Request, supabase: SupabaseClient) {
  const body = await readJson(request);
  const payload = eventPayload(body);
  const allowConflict = optionalBoolean(body, ["allowConflict", "allow_conflict"]) ?? false;
  const conflicts = await findEventConflicts(supabase, payload);

  if (conflicts.length > 0 && isBlockingEventStatus(payload.status) && !allowConflict) {
    throw new ApiError(409, "event_conflict", "This event overlaps an existing booking or hold.", {
      conflicts,
      override: "Send allowConflict: true to save anyway after staff review.",
    });
  }

  const { data, error } = await supabase.from("events").insert(payload).select("*").single();

  if (error) throw new ApiError(500, "event_create_failed", "Could not create event record.", error.message);
  return ok(request, { ...data, conflict_warnings: conflicts }, 201);
}

async function fetchAdminEvents(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const status = queryStatus(url, EVENT_STATUSES, "Event status");
  const fromDate = queryDate(url, "from", "From date");
  const toDate = queryDate(url, "to", "To date");
  let query = supabase
    .from("events")
    .select(`
      id,
      title,
      event_type,
      event_date,
      start_time,
      end_time,
      venue_name,
      location,
      guest_count,
      status,
      visibility,
      notes,
      internal_notes,
      setup_notes,
      timeline_notes,
      calendar_sync_id,
      created_at,
      updated_at,
      clients(id, full_name, email, phone),
      venues(id, name, city, state)
    `);

  if (status) query = query.eq("status", status);
  if (fromDate) query = query.gte("event_date", fromDate);
  if (toDate) query = query.lte("event_date", toDate);

  const { data, error } = await query
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw new ApiError(500, "events_fetch_failed", "Could not fetch event records.", error.message);
  return ok(request, annotateEventConflicts((data ?? []) as Record<string, unknown>[]));
}

function isoWindowsOverlap(startA: unknown, endA: unknown, startB: unknown, endB: unknown) {
  const aStart = Date.parse(String(startA || ""));
  const aEnd = Date.parse(String(endA || ""));
  const bStart = Date.parse(String(startB || ""));
  const bEnd = Date.parse(String(endB || ""));
  if ([aStart, aEnd, bStart, bEnd].some((value) => Number.isNaN(value))) return false;
  return aStart < bEnd && bStart < aEnd;
}

function availabilityConflictSummary(type: string, record: Record<string, unknown>) {
  return {
    id: String(record.id || ""),
    type,
    title: String(record.title || (type === "event" ? "Event" : "Availability block")),
    status: String(record.status || record.block_type || ""),
    startAt: record.start_at ? String(record.start_at) : null,
    endAt: record.end_at ? String(record.end_at) : null,
    eventDate: record.event_date ? String(record.event_date) : null,
    startTime: record.start_time ? String(record.start_time) : null,
    endTime: record.end_time ? String(record.end_time) : null,
  };
}

function zonedIsoParts(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_AVAILABILITY_TIMEZONE,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function legacyEventOverlapsBlock(event: Record<string, unknown>, block: Record<string, unknown>) {
  if (!event.event_date) return false;
  const blockStart = zonedIsoParts(block.start_at);
  const blockEnd = zonedIsoParts(block.end_at);
  if (!blockStart || !blockEnd) return false;
  const startDate = blockStart.date;
  const endDate = blockEnd.date;
  const eventDate = String(event.event_date);
  if (eventDate < startDate || eventDate > endDate) return false;
  if (block.all_day) return true;

  const blockStartTime = eventDate === startDate ? blockStart.time : "00:00";
  const blockEndTime = eventDate === endDate ? blockEnd.time : "23:59";
  return eventTimesOverlap(blockStartTime, blockEndTime, event.start_time, event.end_time);
}

async function findAvailabilityBlockConflicts(
  supabase: SupabaseClient,
  block: Record<string, unknown>,
  ignoreBlockId?: string,
) {
  const startAt = String(block.start_at || "");
  const endAt = String(block.end_at || "");
  if (!startAt || !endAt) return [];

  const [eventsResult, blocksResult] = await Promise.all([
    supabase
      .from("events")
      .select(`
        id,
        title,
        event_date,
        start_time,
        end_time,
        start_at,
        end_at,
        status
      `)
      .in("status", [...EVENT_BLOCKING_STATUSES])
      .limit(150),
    (() => {
      let query = supabase
        .from("availability_blocks")
        .select("id, title, block_type, status, start_at, end_at, all_day")
        .lt("start_at", endAt)
        .gt("end_at", startAt)
        .limit(150);
      if (ignoreBlockId) query = query.neq("id", ignoreBlockId);
      return query;
    })(),
  ]);

  const failures = [eventsResult.error?.message, blocksResult.error?.message].filter(Boolean);
  if (failures.length > 0) {
    throw new ApiError(500, "availability_conflict_check_failed", "Could not check availability conflicts.", failures.join("; "));
  }

  const seen = new Set<string>();
  const eventConflicts = ((eventsResult.data ?? []) as Record<string, unknown>[])
    .filter((event) => {
      if (event.start_at && event.end_at) return isoWindowsOverlap(startAt, endAt, event.start_at, event.end_at);
      return legacyEventOverlapsBlock(event, block);
    })
    .filter((event) => {
      const id = String(event.id || "");
      if (!id || seen.has(`event:${id}`)) return false;
      seen.add(`event:${id}`);
      return true;
    })
    .map((event) => availabilityConflictSummary("event", event));

  const blockConflicts = ((blocksResult.data ?? []) as Record<string, unknown>[])
    .filter((candidate) => isoWindowsOverlap(startAt, endAt, candidate.start_at, candidate.end_at))
    .map((candidate) => availabilityConflictSummary("availability_block", candidate));

  return [...eventConflicts, ...blockConflicts];
}

async function fetchAdminAvailabilityBlocks(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const typeParam = url.searchParams.get("type") ?? url.searchParams.get("status");
  if (typeParam && typeParam !== "all" && !AVAILABILITY_BLOCK_TYPES.has(typeParam)) {
    throw new ApiError(400, "validation_error", "Availability block type is not supported.", {
      field: url.searchParams.has("type") ? "type" : "status",
      allowed: [...AVAILABILITY_BLOCK_TYPES],
    });
  }
  const type = typeParam && typeParam !== "all" ? typeParam : null;
  let query = supabase
    .from("availability_blocks")
    .select(`
      id,
      title,
      block_type,
      status,
      start_at,
      end_at,
      all_day,
      public_message,
      internal_notes,
      reason,
      created_at,
      updated_at
    `);

  if (type) query = query.eq("block_type", type);

  const { data, error } = await query
    .order("start_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new ApiError(500, "availability_blocks_fetch_failed", "Could not fetch availability blocks.", error.message);
  }

  const blocks = (data ?? []) as Record<string, unknown>[];
  const annotated = await Promise.all(blocks.map(async (block) => ({
    ...block,
    conflict_warnings: await findAvailabilityBlockConflicts(supabase, block, String(block.id || "")),
  })));

  return ok(request, annotated);
}

async function createAvailabilityBlockRecord(
  request: Request,
  supabase: SupabaseClient,
  admin: Awaited<ReturnType<typeof requireAdmin>>,
) {
  const payload = availabilityBlockPayload(await readJson(request), String(admin.projectNeoUser.id));
  const conflictWarnings = await findAvailabilityBlockConflicts(supabase, payload);

  const { data, error } = await supabase
    .from("availability_blocks")
    .insert(payload)
    .select(`
      id,
      title,
      block_type,
      status,
      start_at,
      end_at,
      all_day,
      public_message,
      internal_notes,
      reason,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new ApiError(500, "availability_block_create_failed", "Could not create availability block.", error.message);
  }

  return ok(request, { ...data, conflict_warnings: conflictWarnings }, 201);
}

async function updateBookingStatus(request: Request, supabase: SupabaseClient, bookingInquiryId: string) {
  const body = await readJson(request);
  const status = requiredEnum(body, ["status"], BOOKING_STATUSES, "Booking status");
  const { data: currentInquiry, error: currentError } = await supabase
    .from("booking_inquiries")
    .select("id, status")
    .eq("id", bookingInquiryId)
    .single();

  if (currentError) {
    throw new ApiError(404, "booking_inquiry_not_found", "Booking inquiry was not found.", currentError.message);
  }

  if (!bookingStatusCanMove(String(currentInquiry.status), status)) {
    throw new ApiError(409, "invalid_status_transition", "Booking inquiry cannot move to that status from its current state.", {
      from: String(currentInquiry.status),
      to: status,
      allowed: BOOKING_STATUS_FLOW[String(currentInquiry.status)] ?? [],
    });
  }

  const update: Record<string, string | null> = {
    status,
  };

  if (hasAnyKey(body, ["adminNotes", "admin_notes", "internalNotes", "internal_notes"])) {
    update.internal_notes = optionalString(body, ["adminNotes", "admin_notes", "internalNotes", "internal_notes"], 4000);
  }

  if (hasAnyKey(body, ["clientId", "client_id"])) {
    update.client_id = optionalUuid(body, ["clientId", "client_id"], "Client ID");
  }

  if (status === "reviewing") {
    update.reviewed_at = new Date().toISOString();
  } else if (status === "confirmed") {
    update.confirmed_at = new Date().toISOString();
  } else if (status === "cancelled") {
    update.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("booking_inquiries")
    .update(update)
    .eq("id", bookingInquiryId)
    .select("*")
    .single();

  if (error) throw new ApiError(500, "booking_status_update_failed", "Could not update booking status.", error.message);
  return ok(request, data);
}

async function createInvoiceRecord(request: Request, supabase: SupabaseClient) {
  const payload = invoicePayload(await readJson(request));
  if (!/^[A-Z]{3}$/.test(payload.currency)) {
    throw new ApiError(400, "validation_error", "Currency must be a three-letter uppercase code.", { field: "currency" });
  }

  const { data, error } = await supabase.from("invoices").insert(payload).select("*").single();

  if (error) throw new ApiError(500, "invoice_create_failed", "Could not create invoice record.", error.message);
  return ok(request, data, 201);
}

async function createPaymentRecord(request: Request, supabase: SupabaseClient) {
  const payload = paymentPayload(await readJson(request));
  if (!/^[A-Z]{3}$/.test(payload.currency)) {
    throw new ApiError(400, "validation_error", "Currency must be a three-letter uppercase code.", { field: "currency" });
  }
  await validatePaymentAgainstInvoice(supabase, payload);

  const { data, error } = await supabase.from("payments").insert(payload).select("*").single();

  if (error) throw new ApiError(500, "payment_create_failed", "Could not create payment record.", error.message);
  return ok(request, data, 201);
}

async function fetchAdminPayments(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const status = queryStatus(url, PAYMENT_STATUSES, "Payment status");
  let query = supabase
    .from("payments")
    .select(`
      id,
      status,
      amount_cents,
      currency,
      payment_type,
      payment_provider,
      provider_payment_id,
      payment_date,
      paid_at,
      refunded_at,
      notes,
      created_at,
      updated_at,
      invoices(
        id,
        invoice_number,
        status,
        total_cents,
        balance_due_cents,
        clients(id, full_name, email),
        events(id, title, event_date)
      )
    `);

  if (status) query = query.eq("status", status);

  const { data, error } = await query
    .order("payment_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "payments_fetch_failed", "Could not fetch payment records.", error.message);
  return ok(request, data ?? []);
}

async function updatePaymentStatus(request: Request, supabase: SupabaseClient, paymentId: string) {
  const payload = paymentStatusPayload(await readJson(request));
  const { data: currentPayment, error: currentError } = await supabase
    .from("payments")
    .select("invoice_id, status, amount_cents, currency, payment_type, payment_provider, provider_payment_id, notes")
    .eq("id", paymentId)
    .single();

  if (currentError) throw new ApiError(404, "payment_not_found", "Payment record was not found.", currentError.message);

  if (payload.status === "paid" && currentPayment.status !== "paid") {
    await validatePaymentAgainstInvoice(supabase, {
      invoice_id: String(currentPayment.invoice_id),
      status: "paid",
      amount_cents: Number(currentPayment.amount_cents),
      currency: String(currentPayment.currency).toUpperCase(),
      payment_type: String(currentPayment.payment_type),
      payment_provider: currentPayment.payment_provider ? String(currentPayment.payment_provider) : null,
      provider_payment_id: currentPayment.provider_payment_id ? String(currentPayment.provider_payment_id) : null,
      payment_date: payload.payment_date,
      paid_at: payload.paid_at,
      refunded_at: null,
      notes: currentPayment.notes ? String(currentPayment.notes) : null,
    });
  } else if (payload.status === "refunded" && currentPayment.status !== "refunded") {
    await validatePaymentAgainstInvoice(supabase, {
      invoice_id: String(currentPayment.invoice_id),
      status: "refunded",
      amount_cents: Number(currentPayment.amount_cents),
      currency: String(currentPayment.currency).toUpperCase(),
      payment_type: String(currentPayment.payment_type),
      payment_provider: currentPayment.payment_provider ? String(currentPayment.payment_provider) : null,
      provider_payment_id: currentPayment.provider_payment_id ? String(currentPayment.provider_payment_id) : null,
      payment_date: payload.payment_date,
      paid_at: currentPayment.status === "paid" ? new Date().toISOString() : null,
      refunded_at: payload.refunded_at,
      notes: currentPayment.notes ? String(currentPayment.notes) : null,
    });
  }

  const { data, error } = await supabase.from("payments").update(payload).eq("id", paymentId).select("*").single();

  if (error) throw new ApiError(500, "payment_status_update_failed", "Could not update payment status.", error.message);
  return ok(request, data);
}

async function fetchAdminVenues(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const { data, error } = await supabase
    .from("venues")
    .select(`
      id,
      name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      website_url,
      contact_name,
      contact_email,
      contact_phone,
      load_in_notes,
      parking_notes,
      power_notes,
      is_preferred,
      created_at,
      updated_at
    `)
    .order("is_preferred", { ascending: false })
    .order("name", { ascending: true })
    .limit(limit);

  if (error) throw new ApiError(500, "venues_fetch_failed", "Could not fetch venue records.", error.message);
  return ok(request, data ?? []);
}

async function fetchAdminMedia(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const { data, error } = await supabase
    .from("gallery_items")
    .select(`
      id,
      title,
      description,
      caption,
      media_type,
      media_category,
      url,
      file_url:url,
      thumbnail_url,
      alt_text,
      event_date,
      venue,
      tags,
      source_type,
      storage_bucket,
      storage_path,
      external_url,
      embed_url,
      provider,
      display_order:sort_order,
      sort_order,
      is_featured,
      is_published,
      created_at,
      updated_at,
      events(id, title, event_date)
    `)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "admin_media_fetch_failed", "Could not fetch media records.", error.message);
  return ok(request, data ?? []);
}

async function fetchAdminTasks(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 50, 100);
  const status = queryStatus(url, TASK_STATUSES, "Task status");
  let query = supabase
    .from("tasks")
    .select(`
      id,
      title,
      description,
      status,
      priority,
      due_at,
      completed_at,
      created_at,
      updated_at,
      events(id, title, event_date),
      clients(id, full_name, email),
      booking_inquiries(id, full_name, event_date)
    `);

  if (status) query = query.eq("status", status);

  const { data, error } = await query
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "tasks_fetch_failed", "Could not fetch task records.", error.message);
  return ok(request, data ?? []);
}

async function markOverdueInvoices(supabase: SupabaseClient, clientId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("invoices")
    .update({ status: "overdue" })
    .eq("status", "sent")
    .eq("amount_paid_cents", 0)
    .lt("due_date", today);

  if (clientId) query = query.eq("client_id", clientId);

  const { error } = await query;

  if (error) throw new ApiError(500, "invoice_overdue_refresh_failed", "Could not refresh overdue invoices.", error.message);
}

async function fetchUpcomingEvents(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 10, 50);
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      event_type,
      event_date,
      start_time,
      end_time,
      venue_name,
      location,
      guest_count,
      status,
      visibility,
      clients(id, full_name, email)
    `)
    .gte("event_date", today)
    .neq("status", "cancelled")
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error) throw new ApiError(500, "upcoming_events_fetch_failed", "Could not fetch upcoming events.", error.message);
  return ok(request, data ?? []);
}

async function evaluatePublicAvailability(
  supabase: SupabaseClient,
  input: {
    eventDate: string;
    startTime: string;
    endTime: string;
    eventType: string | null;
    timezone: string;
    startAt: string;
    endAt: string;
  },
) {
  try {
    const { data: timedEvents, error: timedEventsError } = await supabase
      .from("events")
      .select("id")
      .eq("status", "confirmed")
      .lt("start_at", input.endAt)
      .gt("end_at", input.startAt)
      .limit(1);

    if (timedEventsError) throw timedEventsError;
    if ((timedEvents ?? []).length > 0) {
      return publicAvailabilityResult("unavailable", "booked_event_conflict");
    }

    const { data: legacyEvents, error: legacyEventsError } = await supabase
      .from("events")
      .select("id, start_time, end_time")
      .eq("event_date", input.eventDate)
      .eq("status", "confirmed")
      .limit(100);

    if (legacyEventsError) throw legacyEventsError;
    const hasLegacyConflict = (legacyEvents ?? []).some((event) => {
      return eventTimesOverlap(input.startTime, input.endTime, event.start_time, event.end_time);
    });

    if (hasLegacyConflict) {
      return publicAvailabilityResult("unavailable", "booked_event_conflict");
    }

    const { data: blocks, error: blocksError } = await supabase
      .from("availability_blocks")
      .select("id, block_type, status, start_at, end_at, all_day")
      .lt("start_at", input.endAt)
      .gt("end_at", input.startAt)
      .limit(100);

    if (blocksError) throw blocksError;

    const overlappingBlocks = blocks ?? [];
    if (
      overlappingBlocks.some((block) => {
        const blockType = String(block.block_type || "");
        return UNAVAILABLE_BLOCK_TYPES.has(blockType);
      })
    ) {
      return publicAvailabilityResult("unavailable", "availability_block_unavailable");
    }

    if (
      overlappingBlocks.some((block) => {
        const blockType = String(block.block_type || "");
        return PENDING_BLOCK_TYPES.has(blockType);
      })
    ) {
      return publicAvailabilityResult("pending", "availability_hold");
    }

    if (
      overlappingBlocks.some((block) => {
        const blockType = String(block.block_type || "");
        return CONTACT_REQUIRED_BLOCK_TYPES.has(blockType);
      })
    ) {
      return publicAvailabilityResult("contact_required", "manual_review_block");
    }

    if (overlappingBlocks.some((block) => String(block.status || "") === "unavailable")) {
      return publicAvailabilityResult("unavailable", "availability_block_unavailable");
    }

    if (overlappingBlocks.some((block) => String(block.status || "") === "pending")) {
      return publicAvailabilityResult("pending", "availability_hold");
    }

    if (overlappingBlocks.some((block) => String(block.status || "") === "contact_required")) {
      return publicAvailabilityResult("contact_required", "manual_review_block");
    }

    return publicAvailabilityResult("available");
  } catch (error) {
    console.error("Public availability check failed", error);
    return publicAvailabilityResult("contact_required", "availability_check_failed");
  }
}

async function availabilitySnapshotForBooking(supabase: SupabaseClient, body: Payload) {
  const parsed = availabilityInputFromBody(body);
  if (!parsed.ok) {
    return {
      requested_start_at: null,
      requested_end_at: null,
      availability_status_at_submission: parsed.result.status,
      availability_checked_at: parsed.result.checked_at,
    };
  }

  const submittedSnapshot = submittedAvailabilitySnapshotFromBody(body);
  if (submittedSnapshot) {
    return {
      requested_start_at: parsed.input.startAt,
      requested_end_at: parsed.input.endAt,
      availability_status_at_submission: submittedSnapshot.status,
      availability_checked_at: submittedSnapshot.checked_at,
    };
  }

  const result = await evaluatePublicAvailability(supabase, parsed.input);
  return {
    requested_start_at: parsed.input.startAt,
    requested_end_at: parsed.input.endAt,
    availability_status_at_submission: result.status,
    availability_checked_at: result.checked_at,
  };
}

async function checkPublicAvailability(request: Request, supabase: SupabaseClient) {
  const body = await readJson(request);
  const parsed = availabilityInputFromBody(body);

  if (!parsed.ok) return ok(request, parsed.result);

  const result = await evaluatePublicAvailability(supabase, parsed.input);
  return ok(request, result);
}

async function fetchPublicAvailability(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 20, 100);
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = queryDate(url, "from", "From date") ?? today;
  const toDate = queryDate(url, "to", "To date");

  let query = supabase
    .from("events")
    .select("event_type, event_date, start_time, end_time, status, visibility")
    .gte("event_date", fromDate)
    .in("status", ["pending", "confirmed", "hold"]);

  if (toDate) query = query.lte("event_date", toDate);

  const { data, error } = await query
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw new ApiError(500, "availability_fetch_failed", "Could not fetch availability.", error.message);

  return ok(request, (data ?? []).map((event) => {
    const status = normalizeEventStatus(String(event.status || "pending"));
    const availabilityStatus = status === "confirmed" ? "booked" : status === "hold" ? "held" : "limited";
    const isPublic = event.visibility === "public";
    const eventType = isPublic ? String(event.event_type || "Event") : "Unavailable";

    return {
      date: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      status: availabilityStatus,
      label: isPublic ? `${eventType} ${availabilityStatus}` : "Unavailable",
      isPublic,
    };
  }));
}

async function fetchAdminInvoices(request: Request, supabase: SupabaseClient) {
  await markOverdueInvoices(supabase);

  const url = new URL(request.url);
  const limit = numericLimit(url, 25, 100);
  const status = url.searchParams.get("status");
  let query = supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      currency,
      issue_date,
      due_date,
      sent_at,
      paid_at,
      payment_provider,
      payment_link_url,
      payment_link_expires_at,
      external_invoice_id,
      external_invoice_url,
      subtotal_cents,
      discount_cents,
      tax_cents,
      deposit_cents,
      deposit_paid_cents,
      amount_paid_cents,
      balance_due_cents,
      total_cents,
      notes,
      terms,
      clients(id, full_name, email),
      events(id, title, event_date)
    `);

  if (status) {
    if (!INVOICE_STATUSES.has(status)) {
      throw new ApiError(400, "validation_error", "Invoice status is not supported.", {
        field: "status",
        allowed: [...INVOICE_STATUSES],
      });
    }
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "invoices_fetch_failed", "Could not fetch invoices.", error.message);
  return ok(request, data ?? []);
}

async function fetchAdminBookingInquiries(request: Request, supabase: SupabaseClient) {
  const url = new URL(request.url);
  const limit = numericLimit(url, 25, 100);
  const status = url.searchParams.get("status");
  let query = supabase
    .from("booking_inquiries")
    .select(`
      id,
      status,
      source,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      subject,
      message,
      event_date,
      start_time,
      end_time,
      requested_start_at,
      requested_end_at,
      availability_status_at_submission,
      availability_checked_at,
      event_type,
      venue_name,
      venue_address,
      city_state,
      location,
      guest_count,
      indoor_outdoor,
      music_preferences,
      budget_range,
      heard_about,
      additional_notes,
      quoted_amount_cents,
      deposit_requested_cents,
      internal_notes,
      reviewed_at,
      confirmed_at,
      cancelled_at,
      created_at,
      updated_at
    `);

  if (status) {
    if (!BOOKING_STATUSES.has(status)) {
      throw new ApiError(400, "validation_error", "Booking status is not supported.", {
        field: "status",
        allowed: [...BOOKING_STATUSES],
      });
    }
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new ApiError(500, "booking_inquiries_fetch_failed", "Could not fetch booking inquiries.", error.message);
  return ok(request, data ?? []);
}

async function fetchDashboardSummary(request: Request, supabase: SupabaseClient) {
  await markOverdueInvoices(supabase);

  const today = new Date().toISOString().slice(0, 10);

  const [
    openInquiries,
    newInquiries,
    upcomingEvents,
    confirmedBookings,
    unpaidInvoices,
    recentInquiries,
    nextEvents,
    openInvoices,
  ] = await Promise.all([
    supabase
      .from("booking_inquiries")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "reviewing", "quoted", "deposit_requested"]),
    supabase
      .from("booking_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today)
      .in("status", ["pending", "confirmed", "hold"]),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today)
      .eq("status", "confirmed"),
    supabase
      .from("invoices")
      .select("id, balance_due_cents")
      .in("status", ["sent", "partially_paid", "overdue"]),
    supabase
      .from("booking_inquiries")
      .select("id, full_name, email, phone, event_date, start_time, end_time, event_type, venue_name, city_state, location, guest_count, budget_range, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id, title, event_date, start_time, end_time, venue_name, location, status, visibility")
      .gte("event_date", today)
      .neq("status", "cancelled")
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        status,
        due_date,
        total_cents,
        deposit_cents,
        deposit_paid_cents,
        balance_due_cents,
        payment_provider,
        payment_link_url,
        clients(id, full_name),
        events(id, title, event_date)
      `)
      .in("status", ["sent", "partially_paid", "overdue"])
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const failures = [
    openInquiries,
    newInquiries,
    upcomingEvents,
    confirmedBookings,
    unpaidInvoices,
    recentInquiries,
    nextEvents,
    openInvoices,
  ]
    .map((result) => result.error?.message)
    .filter(Boolean);

  if (failures.length > 0) {
    throw new ApiError(500, "dashboard_summary_fetch_failed", "Could not fetch dashboard summary.", failures.join("; "));
  }

  const unpaidInvoiceCents = (unpaidInvoices.data ?? []).reduce((sum, invoice) => {
    return sum + Number(invoice.balance_due_cents ?? 0);
  }, 0);

  return ok(request, {
    counts: {
      openBookingInquiries: openInquiries.count ?? 0,
      newBookingInquiries: newInquiries.count ?? 0,
      upcomingEvents: upcomingEvents.count ?? 0,
      confirmedBookings: confirmedBookings.count ?? 0,
      openInvoices: (unpaidInvoices.data ?? []).length,
    },
    money: {
      unpaidInvoiceCents,
      currency: "USD",
    },
    recentBookingInquiries: recentInquiries.data ?? [],
    nextEvents: nextEvents.data ?? [],
    openInvoices: openInvoices.data ?? [],
  });
}

async function routeRequest(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(request) });
  }

  const supabase = getSupabaseAdmin();
  const path = normalizePath(request);
  const url = new URL(request.url);

  if (request.method === "GET" && path === "/health") {
    return ok(request, { service: "project-neo-api", status: "ok" });
  }

  if (request.method === "POST" && path === "/booking-inquiries") {
    return submitBookingInquiry(request, supabase);
  }

  if (request.method === "POST" && path === "/contact-messages") {
    return submitContactMessage(request, supabase);
  }

  if (request.method === "GET" && path === "/media") {
    return fetchMediaRecords(request, supabase);
  }

  if (request.method === "GET" && path === "/mixes") {
    return fetchMixRecords(request, supabase);
  }

  if (request.method === "GET" && path === "/service-packages") {
    return fetchServicePackages(request, supabase);
  }

  if (request.method === "POST" && (path === "/availability-check" || path === "/availability/check")) {
    return checkPublicAvailability(request, supabase);
  }

  if (request.method === "GET" && path === "/availability") {
    return fetchPublicAvailability(request, supabase);
  }

  if (path.startsWith("/portal/")) {
    const portal = await requirePortalClient(request, supabase);

    if (request.method === "GET" && path === "/portal/me") {
      return fetchPortalProfile(request, portal);
    }

    if (request.method === "GET" && path === "/portal/summary") {
      return fetchPortalSummary(request, supabase, portal);
    }

    if (request.method === "POST" && path === "/portal/song-requests") {
      return createPortalSongRequest(request, supabase, portal);
    }

    const songRequestMatch = path.match(/^\/portal\/song-requests\/([^/]+)$/);
    if (request.method === "PATCH" && songRequestMatch) {
      const songRequestId = songRequestMatch[1];
      if (!UUID_RE.test(songRequestId)) {
        throw new ApiError(400, "validation_error", "Song request ID must be a valid UUID.", { field: "songRequestId" });
      }
      return updatePortalSongRequest(request, supabase, portal, songRequestId);
    }

    const eventNoteMatch = path.match(/^\/portal\/event-notes\/([^/]+)$/);
    if (request.method === "PATCH" && eventNoteMatch) {
      const eventNoteId = eventNoteMatch[1];
      if (!UUID_RE.test(eventNoteId)) {
        throw new ApiError(400, "validation_error", "Event note ID must be a valid UUID.", { field: "eventNoteId" });
      }
      return updatePortalEventNote(request, supabase, portal, eventNoteId);
    }
  }

  if (path.startsWith("/admin/")) {
    const admin = await requireAdmin(request, supabase);

    if (request.method === "GET" && path === "/admin/me") {
      return fetchAdminProfile(request, admin);
    }

    if (request.method === "GET" && path === "/admin/clients") {
      return fetchAdminClients(request, supabase);
    }

    if (request.method === "POST" && path === "/admin/clients") {
      return createClientRecord(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/events") {
      return fetchAdminEvents(request, supabase);
    }

    if (request.method === "POST" && path === "/admin/events") {
      return createEventRecord(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/availability-blocks") {
      return fetchAdminAvailabilityBlocks(request, supabase);
    }

    if (request.method === "POST" && path === "/admin/availability-blocks") {
      return createAvailabilityBlockRecord(request, supabase, admin);
    }

    if (request.method === "GET" && path === "/admin/events/upcoming") {
      return fetchUpcomingEvents(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/dashboard-summary") {
      return fetchDashboardSummary(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/booking-inquiries") {
      return fetchAdminBookingInquiries(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/invoices") {
      return fetchAdminInvoices(request, supabase);
    }

    if (request.method === "POST" && path === "/admin/invoices") {
      return createInvoiceRecord(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/payments") {
      return fetchAdminPayments(request, supabase);
    }

    if (request.method === "POST" && path === "/admin/payments") {
      return createPaymentRecord(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/venues") {
      return fetchAdminVenues(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/media") {
      return fetchAdminMedia(request, supabase);
    }

    if (request.method === "GET" && path === "/admin/tasks") {
      return fetchAdminTasks(request, supabase);
    }

    const bookingStatusMatch = path.match(/^\/admin\/booking-inquiries\/([^/]+)\/status$/);
    if (request.method === "PATCH" && bookingStatusMatch) {
      const bookingInquiryId = bookingStatusMatch[1];
      if (!UUID_RE.test(bookingInquiryId)) {
        throw new ApiError(400, "validation_error", "Booking inquiry ID must be a valid UUID.", {
          field: "bookingInquiryId",
        });
      }
      return updateBookingStatus(request, supabase, bookingInquiryId);
    }

    const paymentStatusMatch = path.match(/^\/admin\/payments\/([^/]+)\/status$/);
    if (request.method === "PATCH" && paymentStatusMatch) {
      const paymentId = paymentStatusMatch[1];
      if (!UUID_RE.test(paymentId)) {
        throw new ApiError(400, "validation_error", "Payment ID must be a valid UUID.", { field: "paymentId" });
      }
      return updatePaymentStatus(request, supabase, paymentId);
    }
  }

  throw new ApiError(404, "not_found", `No route found for ${request.method} ${url.pathname}.`);
}

serve((request) => routeRequest(request).catch((error) => fail(request, error)));
