const jsonRequests = new Map();
const resizeCleanups = new WeakMap();

export function resolveUrl(source, baseUrl = document.baseURI) {
  if (source instanceof URL) return source.href;
  return new URL(source, baseUrl).href;
}

export function fetchJson(
  source,
  { baseUrl = document.baseURI, label = "Data", cache = true } = {},
) {
  const url = resolveUrl(source, baseUrl);
  const cachedRequest = cache ? jsonRequests.get(url) : null;

  if (cachedRequest) return cachedRequest;

  const request = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`${label} request failed with status ${response.status}.`);
    }

    return response.json();
  });

  if (cache) {
    jsonRequests.set(url, request);
    request.catch(() => {
      if (jsonRequests.get(url) === request) jsonRequests.delete(url);
    });
  }

  return request;
}

export function findCountryMap(owner, scope = document) {
  return (
    owner?.closest?.(".country-page")?.querySelector("[data-country-map]") ||
    scope.querySelector("[data-country-map]")
  );
}

export function observeResize(owner, targets, update) {
  resizeCleanups.get(owner)?.();

  const observedTargets = (Array.isArray(targets) ? targets : [targets]).filter(
    Boolean,
  );
  const runUpdate = () => update();

  runUpdate();

  let cleanup;
  if (observedTargets.length === 0) {
    cleanup = () => {};
  } else if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(runUpdate);
    observedTargets.forEach((target) => observer.observe(target));
    cleanup = () => observer.disconnect();
  } else {
    window.addEventListener("resize", runUpdate);
    cleanup = () => window.removeEventListener("resize", runUpdate);
  }

  const trackedCleanup = () => {
    cleanup();
    if (resizeCleanups.get(owner) === trackedCleanup) {
      resizeCleanups.delete(owner);
    }
  };

  resizeCleanups.set(owner, trackedCleanup);
  return trackedCleanup;
}

export function onDomReady(callback) {
  if (document.readyState !== "loading") {
    return Promise.resolve().then(callback);
  }

  return new Promise((resolve, reject) => {
    document.addEventListener(
      "DOMContentLoaded",
      () => Promise.resolve().then(callback).then(resolve, reject),
      { once: true },
    );
  });
}
