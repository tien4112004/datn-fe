import {
  Settings,
  Database,
  Cpu,
  FileText,
  Filter,
  BrainCircuit,
  Layers,
  Sparkles,
  Terminal,
  SearchCode,
  LibraryBig,
  Binary,
  Zap,
} from 'lucide-react';
import { FlowNode, ConnectionArrow } from './shared';

const Doc2 = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 p-8 font-sans text-slate-800">
      {/* Tiêu đề */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
          <Zap size={14} /> Pipeline Suy luận & Thực thi
        </div>
        <h1 className="mb-2 flex items-center justify-center gap-3 text-4xl font-black tracking-tighter">
          <BrainCircuit className="text-blue-600" size={40} />
          LUỒNG XỬ LÝ CHÍNH
        </h1>
        <p className="text-lg font-medium italic text-slate-500">
          Định tuyến, Lọc, Truy xuất và Thực thi Suy luận
        </p>
      </div>

      <div className="flex w-full max-w-[1600px] flex-col gap-8">
        {/* Tầng 2: Luồng Pipeline Chính */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col gap-4">
            <FlowNode icon={SearchCode} title="Tiền xử lý" description="Phân tích yêu cầu" color="blue" />
            <FlowNode icon={Terminal} title="Stream Log" description="Theo dõi phiên" color="slate" />
          </div>

          <ConnectionArrow label="Định tuyến" />

          <div className="relative flex flex-col gap-8 rounded-[2.5rem] border-2 border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute -top-3 left-10 rounded-full bg-blue-600 px-5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
              Dịch vụ Logic
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rotate-180 items-center justify-center rounded-lg bg-blue-600 px-2 py-3 text-[9px] font-bold uppercase text-white [writing-mode:vertical-lr]">
                Prompt
              </div>
              <FlowNode icon={Layers} title="Phân loại" description="Môn / Lớp / Chủ đề" color="blue" />
              <ConnectionArrow short />
              <FlowNode
                icon={Settings}
                title="System Prompt"
                description="Cấu hình chuyên gia"
                color="blue"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rotate-180 items-center justify-center rounded-lg bg-orange-500 px-2 py-3 text-center text-[9px] font-bold uppercase leading-none text-white [writing-mode:vertical-lr]">
                Filter
              </div>
              <FlowNode icon={Binary} title="Lọc môn học" description="Tách mã mục tiêu" color="orange" />
              <ConnectionArrow short />
              <FlowNode icon={Filter} title="Lọc khối lớp" description="Sàng lọc trình độ" color="orange" />
              <ConnectionArrow short />
              <FlowNode icon={LibraryBig} title="Retrieving" description="RAG từ Vector DB" color="orange" />
            </div>
          </div>

          <ConnectionArrow label="Thực thi" />

          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 p-[3px] shadow-xl">
            <div className="flex w-56 flex-col items-center gap-4 rounded-[21px] bg-white p-6 text-center">
              <div className="rounded-full bg-blue-100 p-4 text-blue-600 shadow-inner">
                <Cpu size={36} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-blue-900">BỘ THỰC THI LLM</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Inference Engine
                </p>
              </div>
              <div className="h-px w-full bg-slate-100"></div>
              <div className="flex items-center gap-2 text-[10px] font-bold italic text-slate-500">
                <Database size={14} className="text-indigo-500" /> Vector Search & Tổng hợp AI
              </div>
            </div>
          </div>

          <ConnectionArrow label="Kết quả" />

          <div className="flex flex-col gap-3">
            {[
              { icon: Sparkles, text: 'Logic giải', desc: 'Giải thích phương pháp' },
              { icon: FileText, text: 'Đáp án cấu trúc', desc: 'Dữ liệu có cấu trúc (JSON)' },
              { icon: Terminal, text: 'Stream Tokens', desc: 'Phản hồi thời gian thực' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex w-52 flex-col rounded-r-xl border border-l-4 border-slate-200 border-l-blue-600 bg-white p-3 shadow-sm"
              >
                <div className="mb-1 flex items-center gap-2">
                  <item.icon className="text-blue-600" size={15} />
                  <span className="text-[10px] font-black uppercase text-slate-800">{item.text}</span>
                </div>
                <span className="pl-6 text-[9px] font-medium text-slate-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chú thích cuối trang */}
      <div className="mt-16 grid w-full max-w-5xl grid-cols-4 gap-8 border-t border-slate-200 pt-8 text-center">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase text-indigo-600">01. INGESTION</p>
          <p className="text-[11px] font-medium text-slate-500">
            Thu thập và chuẩn hóa tri thức thô vào không gian Vector.
          </p>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase text-blue-600">02. ROUTING</p>
          <p className="text-[11px] font-medium text-slate-500">
            Định tuyến yêu cầu và gán ngữ cảnh chuyên gia (Expert Prompt).
          </p>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase text-orange-600">03. RETRIEVAL</p>
          <p className="text-[11px] font-medium text-slate-500">
            Sàng lọc dữ liệu tầng sâu và truy xuất thông tin bổ trợ.
          </p>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase text-slate-900">04. INFERENCE</p>
          <p className="text-[11px] font-medium text-slate-500">
            Tổng hợp dữ liệu và thực thi suy luận logic qua mô hình LLM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Doc2;
