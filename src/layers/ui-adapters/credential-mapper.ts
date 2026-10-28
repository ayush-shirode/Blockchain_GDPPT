export interface StatusDisplay {
  label: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
  iconName:
    | "check-circle"
    | "clock"
    | "clock-alert"
    | "ban"
    | "x-circle"
    | "alert-triangle"
    | "circle-dashed"
    | "flask";
}

export function getStatusDisplay(
  status: string,
  expiresAt?: string | Date
): StatusDisplay {
  const norm = (status || "").toUpperCase();

  if (norm === "ACTIVE" || norm === "VALID") {
    if (expiresAt) {
      const expDate = new Date(expiresAt);
      const diffDays = Math.ceil(
        (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 0) {
        return {
          label: "Expired",
          tone: "warning",
          iconName: "clock-alert",
        };
      }
      if (diffDays <= 30) {
        return {
          label: `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
          tone: "warning",
          iconName: "clock",
        };
      }
    }
    return {
      label: norm === "ACTIVE" ? "Active" : "Valid",
      tone: "success",
      iconName: "check-circle",
    };
  }

  if (norm === "EXPIRED") {
    return {
      label: "Expired",
      tone: "warning",
      iconName: "clock-alert",
    };
  }

  if (norm === "REVOKED") {
    return {
      label: "Revoked",
      tone: "danger",
      iconName: "ban",
    };
  }

  if (norm === "INVALID") {
    return {
      label: "Invalid",
      tone: "danger",
      iconName: "x-circle",
    };
  }

  if (norm === "UNAVAILABLE" || norm === "UNABLE_TO_VERIFY") {
    return {
      label: "Unable to verify",
      tone: "neutral",
      iconName: "alert-triangle",
    };
  }

  if (norm === "PENDING") {
    return {
      label: "Pending",
      tone: "neutral",
      iconName: "circle-dashed",
    };
  }

  if (norm === "SIMULATED") {
    return {
      label: "Simulated",
      tone: "info",
      iconName: "flask",
    };
  }

  return {
    label: status,
    tone: "neutral",
    iconName: "circle-dashed",
  };
}
