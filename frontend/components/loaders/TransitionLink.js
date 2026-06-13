"use client";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

export default function TransitionLink({ href, children, className = "", onClick, ...props }) {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();

  const handleClick = (e) => {
    if (onClick) onClick(e);

    // Skip custom transition if standard target modifiers are pressed
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    e.preventDefault();

    // If we're already on the destination page, don't show the transition loader
    if (pathname === href) {
      return;
    }

    startLoading();
    router.push(href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
