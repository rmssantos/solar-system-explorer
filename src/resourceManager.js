/**
 * Resource Manager - Handles cleanup of Three.js resources
 * Prevents memory leaks from textures, geometries, and materials
 */
import * as THREE from 'three';

export class ResourceManager {
    constructor() {
        this.textures = new Map();
        this.geometries = new Set();
        this.materials = new Set();
        this.meshes = new Set();
        
        // Track texture loader
        this.textureLoader = new THREE.TextureLoader();
    }

    /**
     * Load a texture and track it for cleanup
     * @param {string} url - Texture URL
     * @param {Function} onLoad - Callback when loaded
     * @returns {THREE.Texture}
     */
    loadTexture(url, onLoad = null) {
        // Return cached texture if already loaded
        if (this.textures.has(url)) {
            const cached = this.textures.get(url);
            if (onLoad) onLoad(cached);
            return cached;
        }

        const texture = this.textureLoader.load(url, (tex) => {
            this.textures.set(url, tex);
            if (onLoad) onLoad(tex);
        });

        return texture;
    }

    /**
     * Track a geometry for cleanup
     * @param {THREE.BufferGeometry} geometry 
     */
    trackGeometry(geometry) {
        this.geometries.add(geometry);
        return geometry;
    }

    /**
     * Track a material for cleanup
     * @param {THREE.Material} material 
     */
    trackMaterial(material) {
        this.materials.add(material);
        return material;
    }

    /**
     * Track a mesh for cleanup
     * @param {THREE.Mesh} mesh 
     */
    trackMesh(mesh) {
        this.meshes.add(mesh);
        if (mesh.geometry) this.trackGeometry(mesh.geometry);
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => this.trackMaterial(m));
            } else {
                this.trackMaterial(mesh.material);
            }
        }
        return mesh;
    }

    /**
     * Dispose a single texture
     * @param {string} url - Texture URL to dispose
     */
    disposeTexture(url) {
        if (this.textures.has(url)) {
            const texture = this.textures.get(url);
            texture.dispose();
            this.textures.delete(url);
            console.log(`🗑️ Disposed texture: ${url}`);
        }
    }

    /**
     * Dispose a single mesh and its resources
     * @param {THREE.Mesh} mesh 
     */
    disposeMesh(mesh) {
        if (!mesh) return;

        // Remove from parent
        if (mesh.parent) {
            mesh.parent.remove(mesh);
        }

        // Dispose geometry
        if (mesh.geometry) {
            mesh.geometry.dispose();
            this.geometries.delete(mesh.geometry);
        }

        // Dispose material(s)
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => {
                    this.disposeMaterial(m);
                });
            } else {
                this.disposeMaterial(mesh.material);
            }
        }

        this.meshes.delete(mesh);
    }

    /**
     * Dispose a material and its textures
     * @param {THREE.Material} material 
     */
    disposeMaterial(material) {
        if (!material) return;

        // Dispose all texture maps
        const textureProps = [
            'map', 'alphaMap', 'aoMap', 'bumpMap', 
            'displacementMap', 'emissiveMap', 'envMap',
            'lightMap', 'metalnessMap', 'normalMap',
            'roughnessMap', 'specularMap'
        ];

        textureProps.forEach(prop => {
            if (material[prop]) {
                material[prop].dispose();
            }
        });

        material.dispose();
        this.materials.delete(material);
    }

    /**
     * Dispose all tracked resources
     * Call this when closing the app or major cleanup needed
     */
    disposeAll() {
        console.log('🧹 Disposing all resources...');

        // Dispose textures
        this.textures.forEach((texture, url) => {
            texture.dispose();
            console.log(`  Disposed texture: ${url}`);
        });
        this.textures.clear();

        // Dispose geometries
        this.geometries.forEach(geometry => {
            geometry.dispose();
        });
        this.geometries.clear();

        // Dispose materials
        this.materials.forEach(material => {
            this.disposeMaterial(material);
        });
        this.materials.clear();

        // Clear mesh references
        this.meshes.clear();

        console.log('✅ All resources disposed');
    }

    /**
     * Get memory usage stats
     * @returns {Object} Stats about tracked resources
     */
    getStats() {
        return {
            textures: this.textures.size,
            geometries: this.geometries.size,
            materials: this.materials.size,
            meshes: this.meshes.size
        };
    }

    /**
     * Log current resource usage
     */
    logStats() {
        const stats = this.getStats();
        console.log('📊 Resource Manager Stats:');
        console.log(`  📸 Textures: ${stats.textures}`);
        console.log(`  📐 Geometries: ${stats.geometries}`);
        console.log(`  🎨 Materials: ${stats.materials}`);
        console.log(`  🧊 Meshes: ${stats.meshes}`);
    }
}

// Singleton instance for global access
export const resourceManager = new ResourceManager();
