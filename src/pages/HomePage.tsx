import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { PawPrint, AlertCircle, ArrowRight, Users } from "lucide-react";

export const HomePage = () => {
  const services = [
    {
      icon: <PawPrint className="w-12 h-12" />,
      title: "Nhận Nuôi Thú Cưng",
      description:
        "Duyệt qua các bé thú cưng đáng yêu đang chờ đợi một mái ấm. Tìm người bạn hoàn hảo của bạn từ những chú chó, mèo và các thú cưng được cứu hộ khác.",
      color: "text-primary-500",
      link: "/pets",
    },
    {
      icon: <AlertCircle className="w-12 h-12" />,
      title: "Báo Cáo Động Vật Cần Giúp",
      description:
        "Nhìn thấy động vật cần giúp đỡ? Hãy báo cáo ngay lập tức. Không cần tài khoản. Đội cứu hộ của chúng tôi sẽ phản hồi nhanh chóng với các trường hợp khẩn cấp hoặc ưu tiên cao.",
      color: "text-red-500",
      link: "/report",
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Tham Gia Chiến Dịch Cứu Hộ",
      description:
        "Trở thành một phần của các nhiệm vụ cứu hộ có tổ chức. Tình nguyện, quyên góp, hoặc tham gia các chiến dịch để cứu động vật. Theo dõi tiến độ và tạo ra sự khác biệt thực sự.",
      color: "text-blue-500",
      link: "/rescues",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary-50 to-primary-100 paw-pattern -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8 mt-20">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900">
              Cho những động vật kém may mắn
              <br />
              <span className="text-primary-600">Một cơ hội thứ hai</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Hãy cùng chúng tôi tạo nên sự khác biệt. Nhận nuôi thú cưng, báo
              cáo động vật cần giúp đỡ, hoặc tham gia các chiến dịch cứu hộ để
              cứu sống nhiều sinh linh.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
              <Button
                as={Link}
                to="/pets"
                size="lg"
                color="primary"
                className="btn-primary text-lg px-10 py-6 font-semibold h-14 min-w-[200px]"
              >
                Nhận Nuôi Thú Cưng
              </Button>
              <Button
                as={Link}
                to="/report"
                size="lg"
                variant="flat"
                color="default"
                className="text-lg px-10 py-6 font-semibold bg-white hover:bg-gray-100 border-2 border-gray-300 h-14 min-w-[200px]"
              >
                Báo Cáo Động Vật Cần Giúp
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Dịch Vụ Của Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Chăm sóc toàn diện và hỗ trợ cho động vật cần giúp đỡ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="card-hover border-2 border-gray-100 hover:border-primary-200 transition-all"
              >
                <CardHeader className="flex-col items-start gap-3 p-6">
                  <div className={`${service.color} mb-2`}>{service.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {service.title}
                  </h3>
                </CardHeader>
                <CardBody className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 mb-6 min-h-[120px]">
                    {service.description}
                  </p>
                  <Button
                    as={Link}
                    to={service.link}
                    variant="light"
                    color="primary"
                    endContent={<ArrowRight className="w-4 h-4" />}
                    className="font-semibold w-fit"
                  >
                    Tìm Hiểu Thêm
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
              Sẵn Sàng Tạo Nên Sự Khác Biệt?
            </h2>
            <p className="text-lg text-primary-50">
              Cho dù bạn muốn nhận nuôi một người bạn lông xù, báo cáo động vật
              cần giúp đỡ, hoặc tình nguyện cho một nhiệm vụ cứu hộ, chúng tôi
              luôn sẵn sàng giúp đỡ.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button
                as={Link}
                to="/register"
                size="lg"
                className="bg-white text-primary-600 font-bold hover:bg-gray-100 px-10 py-6 text-base h-14 min-w-[220px]"
              >
                Bắt Đầu Ngay Hôm Nay
              </Button>
              <Button
                as={Link}
                to="/rescues"
                size="lg"
                variant="flat"
                className="border-2 border-white text-white font-bold hover:bg-white hover:text-primary-600 px-10 py-6 text-base h-14 min-w-[220px] bg-transparent"
              >
                Xem Các Chiến Dịch Cứu Hộ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Thú Cưng Được Nhận Nuôi" },
              { number: "1,200+", label: "Động Vật Được Cứu" },
              { number: "350+", label: "Tình Nguyện Viên" },
              { number: "98%", label: "Tỷ Lệ Thành Công" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
