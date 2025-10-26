import { useState, useEffect } from "react";
import axios from "axios";

type Mode = "food" | "invoice";

interface HistoryItem {
  id: number;
  type: Mode;
  imageUrl: string;
  resultJson: any;
  createdAt: string;
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("food");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // 🆕 大圖預覽

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const upload = async () => {
    if (!file) return alert("請選擇圖片");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("type", mode);
      const res = await axios.post("http://localhost:8080/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
      fetchHistory();
    } catch (e) {
      alert("上傳或辨識失敗");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const res = await axios.get("http://localhost:8080/api/results");
    setHistory(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🥦 食材辨識結果顯示
  const renderFood = (data: any) => {
    const labels = data?.labelAnnotations || [];
    if (!labels.length) return <p>未偵測到食材項目。</p>;
    return (
      <ul className="list-disc ml-5 space-y-1">
        {labels.slice(0, 5).map((l: any) => (
          <li key={l.description}>
            <span className="font-semibold">{l.description}</span>{" "}
            <span className="text-gray-500">
              ({(l.score * 100).toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // 🧾 發票OCR顯示整理
  const renderInvoice = (data: any) => {
    const text = data?.textAnnotations?.[0]?.description || "";
    if (!text) return <p>未偵測到文字內容。</p>;
    const lines: string[] = text
      .split("\n")
      .filter((l: string) => l.trim() !== "");

    const date = lines.find((l: string) => /\d{4}[./-]\d{2}[./-]\d{2}/.test(l));
    const total = lines.find((l: string) => /[NT\$]\s?\d+/.test(l));
    const items = lines.filter(
      (l: string) =>
        /[\u4e00-\u9fa5]/.test(l) &&
        /\d/.test(l) &&
        !/發票|統編|店|日期|總計|金額|營業人/.test(l)
    );

    return (
      <div className="space-y-2">
        {date && (
          <p>
            📅 <span className="font-semibold">日期：</span> {date}
          </p>
        )}
        {total && (
          <p>
            💰 <span className="font-semibold">總金額：</span> {total}
          </p>
        )}
        {items.length > 0 && (
          <div>
            🧾 <span className="font-semibold">主要品項：</span>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {items.map((l: string, i: number) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // 🖼 大圖 Modal
  const ImageModal = () =>
    previewImage && (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        onClick={() => setPreviewImage(null)}
      >
        <img
          src={previewImage}
          alt="preview-large"
          className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
        />
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4">
      {/* 左側：上傳與辨識 */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center">食材 / 發票辨識</h1>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              alt="preview"
              className="max-h-64 rounded-lg shadow border"
            />
          </div>
        )}

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="border p-2 w-full rounded"
        >
          <option value="food">食材辨識</option>
          <option value="invoice">發票OCR</option>
        </select>

        <button
          disabled={loading}
          onClick={upload}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "辨識中..." : "上傳並辨識"}
        </button>

        {result && (
          <div className="bg-gray-100 p-3 rounded-md mt-4">
            <h3 className="font-semibold mb-2">辨識結果</h3>
            {mode === "food"
              ? renderFood(result.resultJson)
              : renderInvoice(result.resultJson)}
          </div>
        )}
      </div>

      {/* 右側：歷史紀錄 */}
      <div className="w-full lg:w-96 bg-gray-50 p-4 rounded-xl shadow-md overflow-y-auto max-h-[80vh]">
        <h3 className="text-lg font-semibold mb-2">📜 歷史紀錄</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">目前沒有辨識紀錄</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => {
              const imgPath = item.imageUrl.startsWith("uploads/")
                ? `http://localhost:8080/${item.imageUrl}`
                : `http://localhost:8080/uploads/${item.imageUrl}`;

              return (
                <li
                  key={item.id}
                  className="p-3 border rounded bg-white shadow-sm cursor-pointer hover:bg-gray-100 transition"
                  onClick={() =>
                    setExpanded(expanded === item.id ? null : item.id)
                  }
                >
                  <div className="flex items-start gap-3">
                    {/* 🖼 縮圖預覽 + 點擊放大 */}
                    <img
                      src={imgPath}
                      alt="thumb"
                      className="w-14 h-14 rounded-md object-cover border cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(imgPath);
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">
                        🕒 {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm font-semibold">
                        類型：{" "}
                        {item.type === "food" ? (
                          <span>🍎 食材</span>
                        ) : (
                          <span>🧾 發票</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.resultJson?.labelAnnotations?.[0]?.description ||
                          item.resultJson?.textAnnotations?.[0]?.description?.slice(
                            0,
                            40
                          ) ||
                          "無資料"}
                      </p>
                    </div>
                  </div>

                  {/* 展開詳細內容 */}
                  {expanded === item.id && (
                    <div className="mt-2 p-2 border-t text-xs bg-gray-50 rounded">
                      {item.type === "food"
                        ? renderFood(item.resultJson)
                        : renderInvoice(item.resultJson)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 🖼 Modal：放大圖片 */}
      <ImageModal />
    </div>
  );
}
