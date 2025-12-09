/**
 * Photo Mode - Take screenshots with the spaceship
 * Saves photos to browser's gallery
 */
import { i18n } from './i18n.js';

export class PhotoMode {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.photoCount = 0;
        this.gallery = [];
        
        this.loadGallery();
        this.createUI();

        // Listen for language changes
        i18n.onLangChange(() => this.updateTranslations());
    }

    updateTranslations() {
        const photoBtn = document.getElementById('photo-btn');
        const galleryBtn = document.getElementById('gallery-btn');
        if (photoBtn) photoBtn.title = i18n.t('take_photo');
        if (galleryBtn) galleryBtn.title = i18n.t('gallery');
    }

    loadGallery() {
        const saved = localStorage.getItem('spaceExplorer_photos');
        if (saved) {
            this.gallery = JSON.parse(saved);
            this.photoCount = this.gallery.length;
        }
    }

    saveGallery() {
        // Keep only last 20 photos to save space
        if (this.gallery.length > 20) {
            this.gallery = this.gallery.slice(-20);
        }
        localStorage.setItem('spaceExplorer_photos', JSON.stringify(this.gallery));
    }

    createUI() {
        // Photo button
        const photoBtn = document.createElement('button');
        photoBtn.id = 'photo-btn';
        photoBtn.className = 'photo-btn';
        photoBtn.innerHTML = '📸';
        photoBtn.title = i18n.t('take_photo');
        photoBtn.style.cssText = `
            position: fixed;
            bottom: 200px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(20, 20, 40, 0.8);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        photoBtn.addEventListener('click', () => this.takePhoto());
        document.body.appendChild(photoBtn);

        // Gallery button
        const galleryBtn = document.createElement('button');
        galleryBtn.id = 'gallery-btn';
        galleryBtn.className = 'gallery-btn';
        galleryBtn.innerHTML = '🖼️';
        galleryBtn.title = i18n.t('gallery');
        galleryBtn.style.cssText = `
            position: fixed;
            bottom: 260px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(20, 20, 40, 0.8);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        galleryBtn.addEventListener('click', () => this.showGallery());
        document.body.appendChild(galleryBtn);

        // Photo counter badge
        this.counterBadge = document.createElement('span');
        this.counterBadge.className = 'photo-counter';
        this.counterBadge.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4444;
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 16px;
            text-align: center;
        `;
        this.counterBadge.innerText = this.photoCount;
        if (this.photoCount === 0) this.counterBadge.style.display = 'none';
        galleryBtn.appendChild(this.counterBadge);

        // Flash effect overlay
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.className = 'camera-flash';
        this.flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            pointer-events: none;
            opacity: 0;
            z-index: 9999;
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(this.flashOverlay);
    }

    takePhoto() {
        // Flash effect
        this.flashOverlay.style.opacity = '0.8';
        setTimeout(() => this.flashOverlay.style.opacity = '0', 200);

        // Play camera sound
        this.playCameraSound();

        // Force a render before capturing
        if (this.app.composer) {
            this.app.composer.render();
        } else if (this.app.renderer) {
            this.app.renderer.render(this.app.scene, this.app.camera);
        }

        // Capture the canvas
        const canvas = this.app.renderer.domElement;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Get current location info
        const currentObject = this.app.cameraControls?.followingObject || 'Sistema Solar';
        const timestamp = new Date().toLocaleString('pt-PT');

        // Create photo object
        const photo = {
            id: Date.now(),
            image: dataUrl,
            location: typeof currentObject === 'string' ? currentObject : currentObject.name || 'Espaço',
            timestamp: timestamp,
            captain: this.app.playerName
        };

        this.gallery.push(photo);
        this.photoCount = this.gallery.length;
        this.counterBadge.innerText = this.photoCount;
        this.counterBadge.style.display = 'block';
        
        this.saveGallery();

        // Show toast
        this.showPhotoToast(photo);
    }

    playCameraSound() {
        // Use the app's existing AudioManager to avoid memory leaks
        // Each new AudioContext consumes resources and is never garbage collected
        if (this.app.audioManager) {
            this.app.audioManager.playCameraShutter();
        }
    }

    showPhotoToast(photo) {
        const toast = document.createElement('div');
        toast.className = 'photo-toast';
        toast.innerHTML = `
            <img src="${photo.image}" alt="Preview" class="photo-preview">
            <div class="photo-toast-info">
                <span class="photo-toast-title">📸 ${i18n.t('photo_saved')}</span>
                <span class="photo-toast-location">📍 ${photo.location}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('visible'));
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    showGallery() {
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        
        let photosHTML = '';
        if (this.gallery.length === 0) {
            photosHTML = `
                <div class="gallery-empty">
                    <span class="empty-icon">📸</span>
                    <p>${i18n.t('no_photos_yet')}</p>
                    <p>${i18n.t('explore_capture')}</p>
                </div>
            `;
        } else {
            photosHTML = this.gallery.map((photo, index) => `
                <div class="gallery-item" data-index="${index}">
                    <img src="${photo.image}" alt="${i18n.t('photo')} ${index + 1}">
                    <div class="gallery-item-info">
                        <span class="gallery-location">📍 ${photo.location}</span>
                        <span class="gallery-time">${photo.timestamp}</span>
                    </div>
                    <div class="gallery-item-actions">
                        <button class="gallery-download" data-index="${index}" title="${i18n.t('download')}">💾</button>
                        <button class="gallery-delete" data-index="${index}" title="${i18n.t('delete')}">🗑️</button>
                    </div>
                </div>
            `).reverse().join('');
        }

        overlay.innerHTML = `
            <div class="gallery-container">
                <div class="gallery-header">
                    <h2>🖼️ ${i18n.t('space_gallery')}</h2>
                    <span class="gallery-subtitle">${i18n.t('captain')} ${this.app.playerName} - ${this.gallery.length} ${i18n.t('photos')}</span>
                    <button class="gallery-close">✕</button>
                </div>
                <div class="gallery-grid">
                    ${photosHTML}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners
        overlay.querySelector('.gallery-close').onclick = () => {
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 300);
            }
        };

        // Download buttons
        overlay.querySelectorAll('.gallery-download').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.downloadPhoto(index);
            };
        });

        // Delete buttons
        overlay.querySelectorAll('.gallery-delete').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.deletePhoto(index, overlay);
            };
        });

        // Click to expand
        overlay.querySelectorAll('.gallery-item img').forEach(img => {
            img.onclick = (e) => {
                e.stopPropagation();
                this.showFullPhoto(img.src);
            };
        });

        requestAnimationFrame(() => overlay.classList.add('visible'));
    }

    downloadPhoto(index) {
        const photo = this.gallery[index];
        if (!photo) return;

        const link = document.createElement('a');
        link.download = `espaco_${photo.location.replace(/\s+/g, '_')}_${photo.id}.jpg`;
        link.href = photo.image;
        link.click();
    }

    deletePhoto(index, overlay) {
        this.gallery.splice(index, 1);
        this.photoCount = this.gallery.length;
        this.counterBadge.innerText = this.photoCount;
        if (this.photoCount === 0) this.counterBadge.style.display = 'none';
        
        this.saveGallery();

        // Refresh gallery
        overlay.remove();
        this.showGallery();
    }

    showFullPhoto(src) {
        const viewer = document.createElement('div');
        viewer.className = 'photo-viewer';
        viewer.innerHTML = `
            <img src="${src}" alt="${i18n.t('photo')}">
            <button class="viewer-close">✕</button>
        `;
        
        document.body.appendChild(viewer);
        
        viewer.onclick = () => {
            viewer.classList.add('closing');
            setTimeout(() => viewer.remove(), 200);
        };
        
        requestAnimationFrame(() => viewer.classList.add('visible'));
    }
}
