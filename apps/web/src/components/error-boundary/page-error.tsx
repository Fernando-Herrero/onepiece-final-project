type PageErrorProps = {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
};

export function PageError({
  title,
  message,
  onRetry,
  retryText,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-semibold text-red-700">{title}</h2>
      {message ? (
        <p className="max-w-md text-sm text-neutral-600">{message}</p>
      ) : null}
      {onRetry ? (
        <button
          className="rounded bg-red-600 px-4 py-2 text-sm text-white"
          type="button"
          onClick={onRetry}
        >
          {retryText}
        </button>
      ) : null}
      <a className="text-sm underline" href="/">
        Volver al inicio
      </a>
    </div>
  );
}
