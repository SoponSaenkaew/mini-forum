<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <meta name="description" content="Tuna Forum - ชุมชนสร้างสรรค์สำหรับแบ่งปันไอเดียและแลกเปลี่ยนความคิดเห็น">
        <meta name="theme-color" content="#4f46e5">

        <title inertia>{{ config('app.name', 'Tuna Forum') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link rel="preload" href="https://fonts.bunny.net/files/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/files/figtree-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
        
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,900&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-100 selection:bg-indigo-500 selection:text-white">
        @inertia
    </body>
</html>
