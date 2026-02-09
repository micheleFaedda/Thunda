// @ts-check
import { defineConfig } from 'astro/config';
import yaml from '@modyfi/vite-plugin-yaml';

// https://astro.build/config
export default defineConfig({
    site: "https://tundha.it",
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'hover'
    },
    redirects: {
        '/pbread': "https://pbread.it"
    },
    output: "static",
    compressHTML: true,
    build: {
        inlineStylesheets: 'auto'
    },
    vite: {
        plugins: [yaml()],
        build: {
            // Better minification
            cssMinify: 'esbuild',
            // Optimize dependencies
            rollupOptions: {
                output: {
                    // Create separate chunks for better caching
                    manualChunks: (id) => {
                        // Separate vendor chunks
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                        // Separate carousel component for lazy loading
                        if (id.includes('PhotoCarousel')) {
                            return 'carousel';
                        }
                        return undefined;
                    },
                    // Use more efficient chunk names
                    assetFileNames: 'assets/[name].[hash][extname]',
                    chunkFileNames: 'chunks/[name].[hash].js',
                    entryFileNames: 'entries/[name].[hash].js'
                }
            },
            // Enable compression hints for deployment
            reportCompressedSize: true,
            // Optimize chunk size
            chunkSizeWarningLimit: 600
        },
        // Optimize dependencies pre-bundling
        optimizeDeps: {
            include: ['astro:assets']
        }
    },
    // Image optimization settings
    image: {
        // Use sharp for better image processing
        service: {
            entrypoint: 'astro/assets/services/sharp'
        }
    }
});
