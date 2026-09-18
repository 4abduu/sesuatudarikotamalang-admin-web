export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Application = {
  id: string;
  applicantName: string;
  contact: string;
  email: string;
  brandName: string;
  description: string;
  category: string;
  /** empty array -> render art placeholder */
  samplePhotos: string[];
  submittedAt: string;
  status: ApplicationStatus;
};

export const applications: Application[] = [
  {
    id: "app1",
    applicantName: "Rina Wulandari",
    contact: "0812-3456-7890",
    email: "rina@linenhouse.id",
    brandName: "Linen House Studio",
    description:
      "Saya bikin pin enamel bertema bangunan heritage Malang, dibuat terbatas 50 pcs per desain. Setiap pin dikemas pakai kertas cokelat dan tali rami.",
    category: "Pin Enamel",
    samplePhotos: [],
    submittedAt: "2 jam lalu",
    status: "pending",
  },
  {
    id: "app2",
    applicantName: "Fajar Nugroho",
    contact: "0857-9988-1234",
    email: "fajar@kayukayu.id",
    brandName: "Kayu Kayu Studio",
    description:
      "Kriya kayu sisa: gantungan kunci, coaster, dan name tag. Kayu jati dan mahoni, dipoles halus tanpa bahan kimia berbahaya.",
    category: "Kriya Kayu",
    samplePhotos: [],
    submittedAt: "5 jam lalu",
    status: "pending",
  },
  {
    id: "app3",
    applicantName: "Lia Maharani",
    contact: "0813-1122-3344",
    email: "lia@postkarstudio.com",
    brandName: "Postkar Studio",
    description:
      "Postcard dan zine hasil risograph. Tema sudut-sudut kota Malang dan cerita pendek tentang orang-orang di Kayutangan.",
    category: "Postcard",
    samplePhotos: [],
    submittedAt: "1 hari lalu",
    status: "pending",
  },
  {
    id: "app4",
    applicantName: "Bayu Setiawan",
    contact: "0821-5566-7788",
    email: "bayu@tanahliat.id",
    brandName: "Tanah Liat Co.",
    description:
      "Mug dan pinjtan keramik glazur warna madu dan terakota. Dibakar di tungku kecil di rumah, kapasitas terbatas 20 pcs per minggu.",
    category: "Keramik",
    samplePhotos: [],
    submittedAt: "2 hari lalu",
    status: "pending",
  },
  {
    id: "app5",
    applicantName: "Dini Aulia",
    contact: "0811-2233-4455",
    email: "dini.draws@gmail.com",
    brandName: "Dini Draws",
    description:
      "Ilustrator yang sudah ada di katalog. Mengajukan batch postcard baru seri jendela heritage.",
    category: "Postcard",
    samplePhotos: [],
    submittedAt: "3 hari lalu",
    status: "approved",
  },
];

export const applicationMap: Record<string, Application> = Object.fromEntries(
  applications.map((a) => [a.id, a]),
);

export const pendingApplications = applications.filter(
  (a) => a.status === "pending",
);
