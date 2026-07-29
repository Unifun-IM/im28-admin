import React from 'react';
import { Carousel } from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';
import locale from './locale';

export default function LoginBanner() {
  const t = useLocale(locale);
  const data = [
    {
      slogan: t['login.banner.slogan1'],
      subSlogan: t['login.banner.subSlogan1'],
      image:
        'http://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6c85f43aed61e320ebec194e6a78d6d3.png~tplv-uwbnlip3yd-png.png',
    },
    {
      slogan: t['login.banner.slogan2'],
      subSlogan: t['login.banner.subSlogan2'],
      image:
        'http://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6c85f43aed61e320ebec194e6a78d6d3.png~tplv-uwbnlip3yd-png.png',
    },
    {
      slogan: t['login.banner.slogan3'],
      subSlogan: t['login.banner.subSlogan3'],
      image:
        'http://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6c85f43aed61e320ebec194e6a78d6d3.png~tplv-uwbnlip3yd-png.png',
    },
  ];
  return (
    <Carousel className="h-full" animation="fade">
      {data.map((item, index) => (
        <div key={`${index}`}>
          <div className="flex h-full flex-col items-center justify-center px-10 text-center text-white">
            <div className="mb-2 text-2xl font-semibold">{item.slogan}</div>
            <div className="mb-6 text-sm text-white/80">{item.subSlogan}</div>
            <img
              alt="banner-image"
              className="max-w-full"
              src={item.image}
            />
          </div>
        </div>
      ))}
    </Carousel>
  );
}
