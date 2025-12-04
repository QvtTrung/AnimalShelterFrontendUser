import { Link } from "react-router-dom";
import {
  PawPrint,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PawPrint className="w-8 h-8 text-primary-500" />
              <span className="font-heading font-bold text-xl text-white">
                Pet Rescue
              </span>
            </div>
            <p className="text-sm">
              Giúp động vật tìm được ngôi nhà mãi mãi và cung cấp dịch vụ cứu hộ
              khẩn cấp cho động vật cần giúp đỡ.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Liên Kết Nhanh
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/pets"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Nhận Nuôi Thú Cưng
                </Link>
              </li>
              <li>
                <Link
                  to="/report"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Báo Cáo Động Vật Cần Giúp
                </Link>
              </li>
              <li>
                <Link
                  to="/rescues"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Chiến Dịch Cứu Hộ
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Về Chúng Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Tài Nguyên
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/volunteer"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Trở Thành Tình Nguyện Viên
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Quyên Góp
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-primary-500 transition-colors"
                >
                  Liên Hệ Chúng Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span className="text-sm">
                  123 Pet Street, Animal City, AC 12345
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary-500" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-500" />
                <span className="text-sm">info@petrescue.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Pet Rescue & Adoption. Bảo lưu mọi
            quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};
