<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <meta name="description" content="Tuna Forum - ชุมชนสำหรับพูดคุยและแลกเปลี่ยนความคิดเห็น">
        
        <meta name="theme-color" content="#4f46e5"> <title inertia>{{ config('app.name', 'Tuna Forum') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-100"> 
        @inertia
    </body>
</html>
