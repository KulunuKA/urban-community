import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { organizationService } from "@/services/organization.service";
import { Spinner } from "@/components/common/Spinner";

const formatDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export default function OrgRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await organizationService.getRequests();
      setRequests(res.data?.data || []);
    } catch (fetchError) {
      console.error("Failed to fetch requests:", fetchError);
      const errorMessage = fetchError?.response?.data?.message || fetchError || "Failed to load requests";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests]);

  const onRespond = async (requestId, status) => {
    try {
      setRespondingId(requestId);
      await organizationService.respondToRequest(requestId, status);
      setRequests((prev) =>
        prev.map((request) =>
          request._id === requestId ? { ...request, status } : request,
        ),
      );
      message.success(`Request ${status.toLowerCase()} successfully.`);
    } catch (respondError) {
      console.error("Failed to respond to request:", respondError);
      const errorMessage = respondError?.response?.data?.message || respondError || "Failed to update request";
      message.error(errorMessage);
    } finally {
      setRespondingId("");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Spinner label="Loading civilian profile" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Event Requests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review citizen join requests for your events and accept or reject them.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {sortedRequests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600">
          No requests found for your events.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {sortedRequests.map((request) => {
            const status = request.status || "Pending";
            const isPending = status === "Pending";
            const isAccepted = status === "Accepted";
            const isRejected = status === "Rejected";
            const isResponding = respondingId === request._id;

            return (
              <article
                key={request._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {request.eventDetails?.title || "Event"}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                      {request.citizenDetails?.name || "Unknown citizen"}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {request.citizenDetails?.email || "No email available"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      isAccepted
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : isRejected
                          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <span className="block text-slate-500">Event Date</span>
                    <span className="font-medium text-slate-900">
                      {formatDate(request.eventDetails?.date)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Location</span>
                    <span className="font-medium text-slate-900">
                      {request.eventDetails?.location || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Requested At</span>
                    <span className="font-medium text-slate-900">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Request ID</span>
                    <span className="font-medium text-slate-900">
                      {request._id}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={!isPending || isResponding}
                    onClick={() => onRespond(request._id, "Rejected")}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResponding ? "Processing..." : "Reject"}
                  </button>
                  <button
                    type="button"
                    disabled={!isPending || isResponding}
                    onClick={() => onRespond(request._id, "Accepted")}
                    className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {isResponding ? "Processing..." : "Accept"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
