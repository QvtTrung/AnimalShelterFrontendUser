import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { NotificationDropdown } from "../notifications";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Adopt a Pet", path: "/pets" },
    { label: "Report Animal", path: "/report" },
    { label: "View Reports", path: "/reports" },
    { label: "Rescue Campaigns", path: "/rescues" },
  ];

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      maxWidth="2xl"
      className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
      height="80px"
      isBlurred
      isBordered
      position="sticky"
      classNames={{
        base: "z-50",
        wrapper: "px-4 sm:px-6",
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo2.png"
              alt="Second Chance Sanctuary Logo"
              className="w-[60%] object-contain"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.path}>
            <Link
              to={item.path}
              className="text-gray-700 hover:text-primary-500 font-semibold text-base transition-colors"
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4">
        {isAuthenticated && user && (
          <>
            {/* Notification Dropdown */}
            <NavbarItem className="hidden sm:flex">
              <NotificationDropdown />
            </NavbarItem>

            {/* User Dropdown */}
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="primary"
                    name={`${user.first_name} ${user.last_name}`}
                    size="md"
                    src={user.avatar}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2"
                    textValue="Profile Info"
                  >
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="dashboard"
                    startContent={<LayoutDashboard className="w-4 h-4" />}
                    textValue="My Dashboard"
                    onPress={() => navigate("/dashboard")}
                  >
                    My Dashboard
                  </DropdownItem>
                  <DropdownItem
                    key="profile-settings"
                    startContent={<UserIcon className="w-4 h-4" />}
                    textValue="Profile Settings"
                    onPress={() => navigate("/profile")}
                  >
                    Profile Settings
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    startContent={<LogOut className="w-4 h-4" />}
                    textValue="Log Out"
                    onPress={handleLogout}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        )}

        {!isAuthenticated && (
          <div className="flex gap-2">
            <NavbarItem className="hidden lg:flex">
              <Button
                as={Link}
                to="/login"
                variant="light"
                color="primary"
                className="font-bold text-base px-4 min-w-20"
                size="md"
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                to="/register"
                color="primary"
                variant="solid"
                className="font-bold text-base px-4 min-w-[90px]"
                size="md"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <Link
              className="w-full text-gray-700 hover:text-primary-500 font-medium text-lg py-2"
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        {!isAuthenticated && (
          <>
            <NavbarMenuItem>
              <Link
                className="w-full text-primary-500 font-semibold text-lg py-2"
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                className="w-full text-primary-500 font-semibold text-lg py-2"
                to="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};
