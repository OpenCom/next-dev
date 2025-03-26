import React from 'react'
import Link from 'next/link'

function Logo() {
  return (
    <Link href="/" className='focus:outline-1 focus:outline-red-300 focus:outline-offset-2'>
        <div className='text-sm leading-0 font-extrabold p-2 h-9 w-9 bg-red-800 text-red-50 flex justify-center items-end tracking-tighter hover:bg-red-700 transition-colors rounded-xs'>PDM</div>
    </Link>
  )
}

export default Logo