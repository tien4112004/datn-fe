import { type Lesson } from '../../types';

// Complete lesson records with nested objectives and resources
// Teacher interface has been removed, only objectives and resources are nested
// This is now the single entry point for all lesson data
export const lessonsTable: Lesson[] = [
  // Class 1A lessons
  {
    id: 'lesson-1',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TV',
    duration: 45,
    status: 'planned',
    title: 'Bài học: Chữ cái và từ đơn giản',
    content: 'Học cách nhận biết và viết chữ cái đầu tiên. Ôn tập các từ đơn giản trong sách giáo khoa.',

    description: 'Học cách nhận biết và viết chữ cái đầu tiên. Ôn tập các từ đơn giản trong sách giáo khoa.',
    objectives: [
      {
        id: 'obj-1-1',

        description: 'Nhận biết được 5 chữ cái đầu bảng chữ cái',
        type: 'knowledge',
        isAchieved: false,
      },
      {
        id: 'obj-1-2',

        description: 'Viết đúng cách các chữ cái đã học',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-1-3',

        description: 'Đọc được các từ đơn giản',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-1-1',
        name: 'Sách giáo khoa Tiếng Việt 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-1-2',
        name: 'Bảng chữ cái',
        type: 'presentation',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-1-3',
        name: 'Bút chì màu',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-2',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'T',
    duration: 45,
    status: 'planned',
    title: 'Số đếm từ 1 đến 10',
    content: 'Ôn tập cách đếm số và nhận biết các chữ số từ 1 đến 10.',

    description: 'Ôn tập cách đếm số và nhận biết các chữ số từ 1 đến 10.',
    objectives: [
      {
        id: 'obj-2-1',

        description: 'Đếm được từ 1 đến 10',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-2-2',

        description: 'Nhận biết chữ số tương ứng',
        type: 'knowledge',
        isAchieved: false,
      },
      {
        id: 'obj-2-3',

        description: 'So sánh số lượng vật',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-2-1',
        name: 'Sách Toán 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-2-2',
        name: 'Que tính',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-2-3',
        name: 'Hình ảnh minh họa',
        type: 'image',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-3',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'AN',
    duration: 45,
    status: 'planned',
    title: 'Nhạc cụ cơ bản',
    content: 'Làm quen với các nhạc cụ cơ bản và nhịp điệu đơn giản.',

    description: 'Làm quen với các nhạc cụ cơ bản và nhịp điệu đơn giản.',
    objectives: [
      {
        id: 'obj-1-1',

        description: 'Nhận biết các nhạc cụ cơ bản',
        type: 'knowledge',
        isAchieved: false,
      },
      {
        id: 'obj-1-2',

        description: 'Hát theo nhịp đơn giản',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-1-3',

        description: 'Tham gia hoạt động âm nhạc',
        type: 'attitude',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-1-1',
        name: 'Sách Âm nhạc 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-1-2',
        name: 'Nhạc cụ cơ bản',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-1-3',
        name: 'Bảng nhạc',
        type: 'presentation',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-4',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'GDTC',
    duration: 45,
    status: 'planned',
    title: 'Bài tập thể dục buổi sáng',
    content: 'Thực hiện các bài tập thể dục cơ bản để khởi động cơ thể.',

    description: 'Thực hiện các bài tập thể dục cơ bản để khởi động cơ thể.',
    objectives: [
      {
        id: 'obj-2-1',

        description: 'Thực hiện đúng động tác thể dục',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-2-2',

        description: 'Hiểu tầm quan trọng của thể dục',
        type: 'knowledge',
        isAchieved: false,
      },
      {
        id: 'obj-2-3',

        description: 'Tham gia tích cực',
        type: 'attitude',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-2-1',
        name: 'Sân chơi',
        type: 'other',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-2-2',
        name: 'Bóng',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
      {
        id: 'res-2-3',
        name: 'Thiết bị thể dục',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  // Class 1A lessons - Tuesday
  {
    id: 'lesson-5',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'T',
    duration: 45,
    status: 'planned',
    title: 'Phép cộng số có nhớ',
    content: 'Học cách thực hiện phép cộng có nhớ trong phạm vi 20.',

    description: 'Học cách thực hiện phép cộng có nhớ trong phạm vi 20.',
    objectives: [
      {
        id: 'obj-3-1',

        description: 'Thực hiện phép cộng có nhớ trong phạm vi 20',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-3-2',

        description: 'Giải thích quy tắc cộng có nhớ',
        type: 'knowledge',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-3-1',
        name: 'Sách Toán 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-3-2',
        name: 'Que tính',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-3-3',
        name: 'Bảng tính cộng',
        type: 'presentation',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-6',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TV',
    duration: 45,
    status: 'planned',
    title: 'Câu đơn giản',
    content: 'Học cách ghép từ thành câu đơn giản.',

    description: 'Học cách ghép từ thành câu đơn giản.',
    objectives: [
      {
        id: 'obj-4-1',

        description: 'Ghép từ thành câu đơn giản',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-4-2',

        description: 'Nhận biết chủ ngữ và vị ngữ trong câu',
        type: 'knowledge',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-4-1',
        name: 'Sách giáo khoa Tiếng Việt 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-4-2',
        name: 'Bảng chữ cái',
        type: 'presentation',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-4-3',
        name: 'Từ ghép',
        type: 'presentation',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-7',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'DD',
    duration: 45,
    status: 'planned',
    title: 'Lòng yêu thương gia đình',
    content: 'Thảo luận về tình cảm gia đình và cách thể hiện tình yêu thương.',

    description: 'Thảo luận về tình cảm gia đình và cách thể hiện tình yêu thương.',
    objectives: [
      {
        id: 'obj-5-1',

        description: 'Thể hiện tình yêu thương với gia đình',
        type: 'attitude',
        isAchieved: false,
      },
      {
        id: 'obj-5-2',

        description: 'Liệt kê cách thể hiện tình yêu thương',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-5-1',
        name: 'Sách Đạo đức 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-5-2',
        name: 'Hình ảnh gia đình',
        type: 'image',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-5-3',
        name: 'Bài hát về gia đình',
        type: 'audio',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-8',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TA',
    duration: 45,
    status: 'planned',
    title: 'Greetings and Introductions',
    content: 'Learn basic greetings and how to introduce yourself in English.',

    description: 'Learn basic greetings and how to introduce yourself in English.',
    objectives: [
      {
        id: 'obj-8-1',

        description: 'Use basic greetings in English',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-8-2',

        description: 'Introduce yourself in simple English sentences',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-8-1',
        name: 'English Textbook Grade 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-8-2',
        name: 'Flashcards with greetings',
        type: 'presentation',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-8-3',
        name: 'Audio recordings',
        type: 'audio',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },

  // Class 1A lessons - Wednesday
  {
    id: 'lesson-9',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TV',
    duration: 45,
    status: 'planned',
    title: 'Âm tiết và từ ghép',
    content: 'Học cách nhận biết và ghép âm tiết thành từ.',

    description: 'Học cách nhận biết và ghép âm tiết thành từ.',
    objectives: [
      {
        id: 'obj-9-1',

        description: 'Ghép âm tiết thành từ',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-9-2',

        description: 'Nhận biết quy tắc ghép âm tiết',
        type: 'knowledge',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-9-1',
        name: 'Sách giáo khoa Tiếng Việt 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-9-2',
        name: 'Thẻ từ',
        type: 'presentation',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-9-3',
        name: 'Bút chì màu',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-10',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'T',
    duration: 45,
    status: 'planned',
    title: 'Hình học cơ bản',
    content: 'Nhận biết các hình cơ bản: tròn, vuông, tam giác.',

    description: 'Nhận biết các hình cơ bản: tròn, vuông, tam giác.',
    objectives: [
      {
        id: 'obj-10-1',

        description: 'Nhận biết các hình cơ bản',
        type: 'knowledge',
        isAchieved: false,
      },
      {
        id: 'obj-10-2',

        description: 'Vẽ các hình cơ bản',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-10-1',
        name: 'Sách Toán 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-10-2',
        name: 'Hình học cơ bản',
        type: 'presentation',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-10-3',
        name: 'Giấy kẻ ô',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-11',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TNXH',
    duration: 45,
    status: 'planned',
    title: 'Gia đình và nhà ở',
    content: 'Tìm hiểu về các thành viên trong gia đình và loại hình nhà ở.',

    description: 'Tìm hiểu về các thành viên trong gia đình và loại hình nhà ở.',
    objectives: [
      {
        id: 'obj-11-1',

        description: 'Liệt kê thành viên trong gia đình',
        type: 'knowledge',
        isAchieved: false,
      },
      {
        id: 'obj-11-2',

        description: 'Mô tả các loại hình nhà ở',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-11-1',
        name: 'Sách Tự nhiên và Xã hội 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-11-2',
        name: 'Hình ảnh nhà ở',
        type: 'image',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-11-3',
        name: 'Mô hình nhà',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-12',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TA',
    duration: 45,
    status: 'planned',
    title: 'Vẽ tranh gia đình',
    content: 'Thực hành vẽ tranh về gia đình bằng bút màu.',

    description: 'Thực hành vẽ tranh về gia đình bằng bút màu.',
    objectives: [
      {
        id: 'obj-12-1',

        description: 'Sử dụng bút màu cơ bản',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-12-2',

        description: 'Thể hiện sáng tạo trong hội họa',
        type: 'attitude',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-12-1',
        name: 'Sách Mỹ thuật 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-12-2',
        name: 'Bút màu',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-12-3',
        name: 'Giấy vẽ',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },

  // Class 1A lessons - Thursday
  {
    id: 'lesson-13',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'T',
    duration: 45,
    status: 'planned',
    title: 'Phép trừ số có nhớ',
    content: 'Học cách thực hiện phép trừ có nhớ trong phạm vi 20.',

    description: 'Học cách thực hiện phép trừ có nhớ trong phạm vi 20.',
    objectives: [
      {
        id: 'obj-13-1',

        description: 'Thực hiện phép trừ có nhớ trong phạm vi 20',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-13-2',

        description: 'Giải thích quy tắc trừ có nhớ',
        type: 'knowledge',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-13-1',
        name: 'Sách Toán 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-13-2',
        name: 'Que tính',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-13-3',
        name: 'Bảng tính trừ',
        type: 'presentation',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-14',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TV',
    duration: 45,
    status: 'planned',
    title: 'Đọc hiểu đoạn văn ngắn',
    content: 'Luyện tập đọc hiểu các đoạn văn ngắn và trả lời câu hỏi.',

    description: 'Luyện tập đọc hiểu các đoạn văn ngắn và trả lời câu hỏi.',
    objectives: [
      {
        id: 'obj-14-1',

        description: 'Đọc đoạn văn ngắn lưu loát',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-14-2',

        description: 'Trả lời câu hỏi về nội dung đoạn văn',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-14-1',
        name: 'Sách giáo khoa Tiếng Việt 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-14-2',
        name: 'Đoạn văn mẫu',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-14-3',
        name: 'Câu hỏi bài đọc',
        type: 'presentation',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-15',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'HDTN',
    duration: 45,
    status: 'planned',
    title: 'Thực hành làm đồ handmade',
    content: 'Làm các đồ handmade đơn giản từ giấy và bút màu.',

    description: 'Làm các đồ handmade đơn giản từ giấy và bút màu.',
    objectives: [
      {
        id: 'obj-15-1',

        description: 'Sử dụng vật liệu handmade an toàn',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-15-2',

        description: 'Thể hiện sự sáng tạo trong làm đồ handmade',
        type: 'attitude',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-15-1',
        name: 'Vật liệu handmade',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-15-2',
        name: 'Hướng dẫn làm đồ handmade',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-15-3',
        name: 'Kéo, băng dính',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-16',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'GDTC',
    duration: 45,
    status: 'planned',
    title: 'Trò chơi vận động',
    content: 'Tham gia các trò chơi vận động tập thể.',

    description: 'Tham gia các trò chơi vận động tập thể.',
    objectives: [
      {
        id: 'obj-16-1',

        description: 'Tham gia trò chơi vận động tập thể',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-16-2',

        description: 'Tuân thủ quy tắc trò chơi',
        type: 'attitude',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-16-1',
        name: 'Sân chơi',
        type: 'other',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-16-2',
        name: 'Bóng',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-16-3',
        name: 'Thiết bị thể dục',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },

  // Class 1A lessons - Friday
  {
    id: 'lesson-17',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'TV',
    duration: 45,
    status: 'planned',
    title: 'Viết đoạn văn tả cảnh',
    content: 'Luyện tập viết đoạn văn tả cảnh đơn giản.',

    description: 'Luyện tập viết đoạn văn tả cảnh đơn giản.',
    objectives: [
      {
        id: 'obj-17-1',

        description: 'Viết câu đơn giản đúng chính tả',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-17-2',

        description: 'Sử dụng dấu câu cơ bản',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-17-1',
        name: 'Sách giáo khoa Tiếng Việt 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-17-2',
        name: 'Vở viết',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-17-3',
        name: 'Bút chì',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-18',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'T',
    duration: 45,
    status: 'planned',
    title: 'Hình học cơ bản',
    content: 'Nhận biết và phân biệt các hình cơ bản.',

    description: 'Nhận biết và phân biệt các hình cơ bản.',
    objectives: [
      {
        id: 'obj-18-1',

        description: 'Giải các phép tính đã học trong tuần',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-18-2',

        description: 'Ôn tập kiến thức toán học cơ bản',
        type: 'knowledge',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-18-1',
        name: 'Sách Toán 1',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-18-2',
        name: 'Bài tập ôn tập',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-18-3',
        name: 'Que tính',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-19',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'HDTN',
    duration: 45,
    status: 'planned',
    title: 'Thực hành vẽ tranh',
    content: 'Vẽ tranh theo chủ đề đơn giản.',

    description: 'Vẽ tranh theo chủ đề đơn giản.',
    objectives: [
      {
        id: 'obj-19-1',

        description: 'Kể lại câu chuyện đơn giản',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-19-2',

        description: 'Lắng nghe và hiểu câu chuyện được kể',
        type: 'skill',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-19-1',
        name: 'Sách truyện thiếu nhi',
        type: 'document',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-19-2',
        name: 'Hình ảnh minh họa truyện',
        type: 'image',
        isRequired: false,
        isPrepared: true,
      },
      {
        id: 'res-19-3',
        name: 'Đồ dùng kể chuyện',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
  {
    id: 'lesson-20',
    classId: '1',
    authorId: 'teacher1',
    className: 'Lớp 1A',
    subject: 'HDTN',
    duration: 45,
    status: 'planned',
    title: 'Hoạt động nhóm',
    content: 'Tham gia các hoạt động nhóm vui vẻ.',

    description: 'Tham gia các hoạt động nhóm vui vẻ.',
    objectives: [
      {
        id: 'obj-20-1',

        description: 'Tham gia biểu diễn văn nghệ đơn giản',
        type: 'skill',
        isAchieved: false,
      },
      {
        id: 'obj-20-2',

        description: 'Thể hiện sự tự tin khi biểu diễn',
        type: 'attitude',
        isAchieved: false,
      },
    ],
    resources: [
      {
        id: 'res-20-1',
        name: 'Nhạc cụ đơn giản',
        type: 'equipment',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-20-2',
        name: 'Bài hát thiếu nhi',
        type: 'audio',
        isRequired: true,
        isPrepared: true,
      },
      {
        id: 'res-20-3',
        name: 'Đồ dùng biểu diễn',
        type: 'equipment',
        isRequired: false,
        isPrepared: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedPeriods: [],
  },
];
