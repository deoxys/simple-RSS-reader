"use client"

import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRouter } from "next/navigation"

export default function BackButton({ url, alt }: { url: string; alt: string }) {
  const router = useRouter()

  const clickHander = () => {
    router.push(url)
  }

  return (
    <button
      className="btn btn-circle absolute left-3 top-3 z-10 block"
      title={alt}
      onClick={clickHander}
    >
      <FontAwesomeIcon icon={faChevronLeft} size={"xl"} />
    </button>
  )
}
