import React from 'react'

const Page2 = () => {
  const baseUrl = window.location.origin +window.Laravel.baseURL;
  return (
    <div style={{width: '80%', margin: 'auto'}}>
      <img style={{width: '100%'}} src={baseUrl + "/images/banner.png"} alt=""/>
    </div>
  )
}

export default Page2
