Jako Head of Marketing a tvůrce obsahu pro Hellocomp.cz potřebuješ něco, co nemá tunu zbytečný korporátní omáčky, ale rovnou doručuje výsledky. Připravil jsem pro tebe dva výstupy, které přesně sednou do tvého AI-assisted workflow.

CSV Šablona: Kompletní struktura pro tvé posty. Obsahuje úderné hooky (žádná nuda, jdeme rovnou na věc), specifikace a sloupeček pro CSS třídu, která definuje animované pozadí.

Futuristic Post Generator (HTML/JS/CSS): Interaktivní nástroj v jednom souboru. Můžeš do něj vložit to CSV a on ti vygeneruje extrémně čisté, futuristické karty ve formátu 9:16 (ideální pro tvé Reels, Shorts a TikTok). Karty mají animované CSS pozadí, glassmorphism efekt a jsou ready na to, abys je buď típnul, nahrál přes OBS, nebo z nich udělal šablonu pro web.

Tady jsou soubory.
Hellocomp Posts Template
22. 2. 13:42

A tady je ten slíbený generátor. Využívá Tailwind CSS pro rychlý layout a custom CSS animace pro ty "extrémně hezké motion backgroundy".
Futuristic Post Generator
22. 2. 13:42

Jak s tím pracovat:
Ty vygenerované karty ve webovém náhledu mají přesně poměr stran, který se parádně hodí pro vertikální obsah (Reels/TikTok). Můžeš si z toho udělat overlay rovnou do DaVinci Resolve (jako grafický prvek přes video), nebo to nasadit na web.

Ty úderné copy texty ("FPS dropy jsou pro boomery") jsou dělané přímo na tvůj sebevědomější, ostřejší styl komunikace. Žádná zbytečná omáčka.

Kód je plně responzivní a barvy (bg-cyber-red, bg-neon-blue) si můžeš v CSS libovolně upravit nebo pomocí AI doplnit o další barevná komba.
###
.csv

id;title;hook;description;specs_cpu;specs_gpu;specs_ram;price;bg_style;cta
1;Hellocomp BEAST 4090;Netroškař. Tohle je bestie.;Žádný kompromisy. FPS dropy neznáme, hraješ všechno na max. Tečka.;Intel Core i9-14900K;NVIDIA RTX 4090 24GB;64GB DDR5 6000MHz;99 990 Kč;bg-cyber-red;Chci bestii
2;Hellocomp ESPORTS Pro;FPS dropy jsou pro boomery.;Tohle tě dostane do Global Elite. Nekompromisní odezva a plynulost.;AMD Ryzen 7 7800X3D;NVIDIA RTX 4070 Ti SUPER;32GB DDR5;45 990 Kč;bg-neon-blue;Znič konkurenci
3;Hellocomp STARTER;Tvůj první reálnej gaming.;Konzole zahoď. Začni hrát jako profík s mašinou, co má smysl.;Intel Core i5-13400F;NVIDIA RTX 4060 8GB;16GB DDR4;22 990 Kč;bg-toxic-green;Začni hrát
4;Hellocomp CREATOR;Render za sekundu, sláva navěky.;DaVinci Resolve to slupne jako malinu. Stříhej 4K bez proxy.;AMD Ryzen 9 7950X;NVIDIA RTX 4080 SUPER;64GB DDR5;68 990 Kč;bg-synthwave;Jdu tvořit

##
post generator
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hellocomp Post Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Inter:wght@300;400;700&display=swap');

        body {
            background-color: #050505;
            color: #ffffff;
            font-family: 'Inter', sans-serif;
        }

        h1, h2, h3, .heading-font {
            font-family: 'Rajdhani', sans-serif;
            text-transform: uppercase;
        }

        /* Animated Backgrounds */
        .bg-cyber-red {
            background: linear-gradient(270deg, #ff003c, #8a0022, #ff003c);
            background-size: 400% 400%;
            animation: gradientMove 8s ease infinite;
        }

        .bg-neon-blue {
            background: linear-gradient(270deg, #00f3ff, #0051ff, #00f3ff);
            background-size: 400% 400%;
            animation: gradientMove 8s ease infinite;
        }

        .bg-toxic-green {
            background: linear-gradient(270deg, #39ff14, #006400, #39ff14);
            background-size: 400% 400%;
            animation: gradientMove 8s ease infinite;
        }

        .bg-synthwave {
            background: linear-gradient(270deg, #ff00ff, #8a2be2, #00ffff);
            background-size: 400% 400%;
            animation: gradientMove 10s ease infinite;
        }

        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Glassmorphism Card */
        .glass-card {
            background: rgba(10, 10, 12, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
        }

        .glass-card::before {
            content: '';
            position: absolute;
            top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
            transform: skewX(-20deg);
            animation: shine 6s infinite;
        }

        @keyframes shine {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
        }

        .cyber-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        
        .cyber-btn:hover {
            background: rgba(255, 255, 255, 0.9);
            color: #000;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
    </style>
</head>
<body class="h-screen flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 z-10 backdrop-blur-md">
        <div>
            <h1 class="text-3xl font-bold tracking-wider text-white">Hellocomp<span class="text-red-500">.cz</span></h1>
            <p class="text-sm text-gray-400 font-light">Content Generator Engine | AI Powered</p>
        </div>
        <button onclick="renderCards()" class="heading-font px-6 py-2 cyber-btn font-bold tracking-widest uppercase">
            Generovat z CSV
        </button>
    </header>

    <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar - CSV Input -->
        <div class="w-1/3 p-6 bg-[#0a0a0c] border-r border-white/10 flex flex-col gap-4 z-10">
            <label class="heading-font text-xl text-gray-300">Vlož CSV Data (odděleno středníkem)</label>
            <textarea id="csvInput" class="w-full flex-1 bg-black/50 border border-white/20 p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-red-500 rounded-lg resize-none">id;title;hook;description;specs_cpu;specs_gpu;specs_ram;price;bg_style;cta
1;Hellocomp BEAST 4090;Netroškař. Tohle je bestie.;Žádný kompromisy. FPS dropy neznáme, hraješ všechno na max. Tečka.;Intel Core i9-14900K;NVIDIA RTX 4090 24GB;64GB DDR5 6000MHz;99 990 Kč;bg-cyber-red;Chci bestii
2;Hellocomp ESPORTS Pro;FPS dropy jsou pro boomery.;Tohle tě dostane do Global Elite. Nekompromisní odezva a plynulost.;AMD Ryzen 7 7800X3D;NVIDIA RTX 4070 Ti SUPER;32GB DDR5;45 990 Kč;bg-neon-blue;Znič konkurenci
3;Hellocomp STARTER;Tvůj první reálnej gaming.;Konzole zahoď. Začni hrát jako profík s mašinou, co má smysl.;Intel Core i5-13400F;NVIDIA RTX 4060 8GB;16GB DDR4;22 990 Kč;bg-toxic-green;Začni hrát
4;Hellocomp CREATOR;Render za sekundu, sláva navěky.;DaVinci Resolve to slupne jako malinu. Stříhej 4K bez proxy.;AMD Ryzen 9 7950X;NVIDIA RTX 4080 SUPER;64GB DDR5;68 990 Kč;bg-synthwave;Jdu tvořit</textarea>
        </div>

        <!-- Main Preview Area -->
        <div class="w-2/3 p-8 overflow-y-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]">
            <div class="flex flex-wrap gap-10 justify-center" id="cardsContainer">
                <!-- Cards will be injected here -->
            </div>
        </div>
    </div>

    <script>
        function parseCSV(csv) {
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(';');
            return lines.slice(1).map(line => {
                const values = line.split(';');
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header.trim()] = values[i] ? values[i].trim() : '';
                });
                return obj;
            });
        }

        function createCardHTML(data) {
            return `
                <div class="relative w-[320px] h-[568px] rounded-2xl p-1 shadow-2xl ${data.bg_style} shrink-0 group">
                    <div class="w-full h-full glass-card rounded-xl p-6 flex flex-col justify-between">
                        
                        <!-- Top Hook -->
                        <div class="space-y-2">
                            <span class="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">
                                ${data.title}
                            </span>
                            <h2 class="text-3xl font-bold leading-tight mt-4 drop-shadow-lg">
                                ${data.hook}
                            </h2>
                            <p class="text-gray-300 text-sm mt-2 font-light">
                                ${data.description}
                            </p>
                        </div>

                        <!-- Specs (Middle) -->
                        <div class="space-y-3 my-6">
                            <div class="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                                <span class="text-sm font-semibold">${data.specs_cpu}</span>
                            </div>
                            <div class="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                                <span class="text-sm font-semibold">${data.specs_gpu}</span>
                            </div>
                            <div class="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                <span class="text-sm font-semibold">${data.specs_ram}</span>
                            </div>
                        </div>

                        <!-- Footer / CTA -->
                        <div class="mt-auto">
                            <div class="text-2xl heading-font font-bold mb-4 text-center tracking-wider">${data.price}</div>
                            <button class="w-full py-4 cyber-btn rounded-lg heading-font font-bold text-lg tracking-widest text-white">
                                ${data.cta}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCards() {
            const csvData = document.getElementById('csvInput').value;
            const parsedData = parseCSV(csvData);
            const container = document.getElementById('cardsContainer');
            
            container.innerHTML = '';
            parsedData.forEach(item => {
                if(item.title) { // basic validation
                    container.innerHTML += createCardHTML(item);
                }
            });
        }

        // Render init
        renderCards();
    </script>
</body>
</html>