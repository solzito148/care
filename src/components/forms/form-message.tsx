type FormMessageProps = {
  message?: string;
  type?: "error" | "success";
};

export function FormMessage({ message, type = "error" }: FormMessageProps) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-3 py-2 text-sm font-medium ${
        type === "error" ? "bg-danger-100 text-danger-700" : "bg-success-100 text-success-700"
      }`}
    >
      {message}
    </p>
  );
}
