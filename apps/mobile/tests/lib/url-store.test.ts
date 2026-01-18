import { setApiUrl, getApiUrl, initApiUrl, onUrlChange } from "@/lib/url-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("Lib: URL Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds http protocol if missing", async () => {
    await setApiUrl("192.168.1.1:8080");
    expect(getApiUrl()).toBe("http://192.168.1.1:8080");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("area_api_url", "http://192.168.1.1:8080");
  });

  it("removes trailing slashes", async () => {
    await setApiUrl("https://api.myapp.com/");
    expect(getApiUrl()).toBe("https://api.myapp.com");
  });

  it("preserves https if present", async () => {
    await setApiUrl("https://secure.api.com");
    expect(getApiUrl()).toBe("https://secure.api.com");
  });

  it("initializes from storage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("http://stored-url.com");

    const url = await initApiUrl();

    expect(url).toBe("http://stored-url.com");
    expect(getApiUrl()).toBe("http://stored-url.com");
  });

  it("handles storage errors gracefully during init", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("Storage fail"));

    const url = await initApiUrl();

    expect(url).toBeDefined();

    consoleSpy.mockRestore();
  });

  it("notifies listeners on change", async () => {
    const listener = jest.fn();
    const unsubscribe = onUrlChange(listener);

    await setApiUrl("http://new-url.com");

    expect(listener).toHaveBeenCalledWith("http://new-url.com");

    unsubscribe();
    await setApiUrl("http://another-url.com");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
