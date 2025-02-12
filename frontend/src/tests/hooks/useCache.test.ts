import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCache } from "../../hooks/useCache";

describe("useCache", () => {
  it("should fetch and cache data", async () => {
    const mockData = { test: "data" };
    const fetchData = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useCache("test-key", fetchData, { revalidateOnMount: true })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      await result.current.revalidate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("should return cached data without fetching", async () => {
    const mockData = { test: "data" };
    const fetchData = vi.fn().mockResolvedValue(mockData);

    // First render to cache data
    const { result: firstResult } = renderHook(() =>
      useCache("test-key", fetchData, { revalidateOnMount: true })
    );

    await act(async () => {
      await firstResult.current.revalidate();
    });

    // Second render should use cached data
    const { result: secondResult } = renderHook(() =>
      useCache("test-key", fetchData, { revalidateOnMount: false })
    );

    expect(secondResult.current.loading).toBe(false);
    expect(secondResult.current.data).toEqual(mockData);
    expect(secondResult.current.error).toBeNull();
    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("should handle errors", async () => {
    const error = new Error("Test error");
    const fetchData = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useCache("test-key", fetchData, { revalidateOnMount: true })
    );

    await act(async () => {
      await result.current.revalidate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it("should refresh data when requested", async () => {
    const mockData1 = { test: "data1" };
    const mockData2 = { test: "data2" };
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result } = renderHook(() =>
      useCache("test-key", fetchData, { revalidateOnMount: true })
    );

    await act(async () => {
      await result.current.revalidate();
    });

    expect(result.current.data).toEqual(mockData1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.data).toEqual(mockData2);
    expect(fetchData).toHaveBeenCalledTimes(2);
  });

  it("should use stale data while revalidating", async () => {
    const mockData1 = { test: "data1" };
    const mockData2 = { test: "data2" };
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result } = renderHook(() =>
      useCache("test-key", fetchData, { revalidateOnMount: true })
    );

    await act(async () => {
      await result.current.revalidate();
    });

    expect(result.current.data).toEqual(mockData1);

    // Start revalidation
    act(() => {
      result.current.revalidate();
    });

    // Should still have stale data while revalidating
    expect(result.current.data).toEqual(mockData1);
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await result.current.revalidate();
    });

    // Should have new data after revalidation
    expect(result.current.data).toEqual(mockData2);
    expect(result.current.loading).toBe(false);
  });
});
