import Link from "next/link"

const Navigation = () => {
  return (
    <div>
        <ul className="flex gap-4 justify-end mx-5 mt-4">
            <li><Link href='/'>Home</Link></li>
            <li><Link href='/product_List'>Product list</Link></li>
        </ul>
    </div>
  )
}

export default Navigation