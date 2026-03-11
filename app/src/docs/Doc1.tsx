import { Database, Binary, Layers, Globe, FileSearch, Zap, BrainCircuit } from 'lucide-react';
import { FlowNode, ConnectionArrow } from './shared';

const Doc1 = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 p-8 font-sans text-slate-800">
      {/* Tiêu đề */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
          <Zap size={14} /> Giai đoạn 1: Nạp Dữ Liệu
        </div>
        <h1 className="mb-2 flex items-center justify-center gap-3 text-4xl font-black tracking-tighter">
          <BrainCircuit className="text-indigo-600" size={40} />
          QUY TRÌNH INGESTION
        </h1>
        <p className="text-lg font-medium italic text-slate-500">
          Thu thập, Phân tích và Lưu trữ tri thức vào không gian Vector
        </p>
      </div>

      <div className="flex w-full max-w-[1600px] flex-col gap-8">
        {/* Tầng 1: Luồng Nạp Dữ Liệu */}
        <div className="relative flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="absolute -top-3 left-8 rounded-full bg-indigo-600 px-4 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Giai đoạn 1: Ingestion
          </div>
          <FlowNode icon={Globe} title="Nguồn dữ liệu" description="PDF / Website / API" color="indigo" />
          <ConnectionArrow label="Thu thập" />
          <FlowNode icon={FileSearch} title="Metadata" description="Trích xuất thuộc tính" color="indigo" />
          <ConnectionArrow />
          <div className="flex gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3">
            <FlowNode icon={Binary} title="OCR/Parsing" description="Chuyển đổi sang MD" color="indigo" />
            <FlowNode icon={Layers} title="Chunking" description="Phân đoạn ngữ cảnh" color="indigo" />
          </div>
          <ConnectionArrow label="Lưu trữ" />
          <FlowNode icon={Database} title="Vector DB" description="Lưu trữ Embedding" color="indigo" />
        </div>
      </div>

      {/* Chú thích cuối trang */}
      <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-8 border-t border-slate-200 pt-8 text-center">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase text-indigo-600">01. THU THẬP</p>
          <p className="text-[11px] font-medium text-slate-500">
            Scraping và trích xuất dữ liệu thô từ nhiều nguồn khác nhau.
          </p>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase text-indigo-600">02. LƯU TRỮ</p>
          <p className="text-[11px] font-medium text-slate-500">
            OCR/Parsing, Chunking và nhúng vào không gian Vector DB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Doc1;
