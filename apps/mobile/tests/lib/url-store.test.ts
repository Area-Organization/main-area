import { setApiUrl, getApiUrl } from "@/lib/url-store";
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
});
