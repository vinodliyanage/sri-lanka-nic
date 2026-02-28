import { Github, Linkedin, Package, Globe } from "lucide-react";
import { GravatarIcon, StackOverflowIcon } from "./icons";
import { name } from "../../../package.json";

const socialLinks = [
  {
    href: "https://www.vinodliyanage.me",
    icon: Globe,
    label: "Portfolio",
  },
  {
    href: "https://github.com/vinodliyanage/sri-lanka-nic",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/vinodliyanage",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: `https://www.npmjs.com/package/${name}`,
    icon: Package,
    label: "npm",
  },
  {
    href: "https://gravatar.com/vinodliyanage",
    icon: GravatarIcon,
    label: "Gravatar",
  },
  {
    href: "https://stackoverflow.com/users/15084645/vinod-liyanage",
    icon: StackOverflowIcon,
    label: "Stack Overflow",
  },
];

export function SocialLinks() {
  return (
    <div className="flex items-center justify-center gap-4">
      {socialLinks.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-text-primary transition-colors"
          title={label}
          aria-label={label}
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}

export function Badges() {
  const encodedPackage = encodeURIComponent(name);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <a href={`https://www.npmjs.com/package/${name}`} target="_blank" rel="noopener noreferrer">
        <img src={`https://img.shields.io/npm/v/${encodedPackage}`} alt="NPM Version" />
      </a>
      <a href={`https://bundlejs.com/?q=${encodedPackage}`} target="_blank" rel="noopener noreferrer">
        <img src={`https://img.shields.io/bundlejs/size/${encodedPackage}`} alt="npm bundle size" />
      </a>
      <a
        href="https://github.com/vinodliyanage/sri-lanka-nic/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={`https://img.shields.io/npm/l/${encodedPackage}`} alt="NPM License" />
      </a>
    </div>
  );
}
