// Interactive Features Module
(function() {
    'use strict';

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        injectStyles();
        createFloatingButton();
        initializeDarkMode();
        initializeAmbientSound();
        
        // Check for saved preferences
        loadUserPreferences();
    }

    // Inject CSS styles
    function injectStyles() {
        const styles = `
            /* Floating Cookie Button */
            .floating-cookie-btn {
                position: fixed;
                bottom: 8rem;
                right: 2rem;
                width: 60px;
                height: 60px;
                background: transparent;
                border: none;
                outline: none;
                box-shadow: none;
                cursor: move;
                z-index: 1500;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3.5rem;
                transition: transform 0.2s ease, filter 0.2s ease;
                animation: float 3s ease-in-out infinite;
                filter: drop-shadow(3px 3px 6px rgba(101, 67, 33, 0.4));
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }

            .floating-cookie-btn:hover {
                transform: scale(1.2) rotate(8deg);
                filter: drop-shadow(5px 5px 10px rgba(101, 67, 33, 0.6));
            }

            .floating-cookie-btn:active {
                cursor: grabbing;
                transform: scale(1.1);
            }

            .floating-cookie-btn:focus {
                outline: none;
                border: none;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-8px) rotate(-3deg); }
                75% { transform: translateY(-8px) rotate(3deg); }
            }

            /* Fun Modal */
            .fun-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                animation: fadeIn 0.3s ease;
            }

            .fun-modal.active {
                display: flex;
            }

            .fun-modal-content {
                background: linear-gradient(135deg, #FEFDF8 0%, #F5E6D3 100%);
                border-radius: 30px;
                padding: 3rem;
                max-width: 600px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 30px 80px rgba(101, 67, 33, 0.5);
                position: relative;
                animation: slideUp 0.4s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .fun-modal-close {
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
                background: rgba(101, 67, 33, 0.1);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 1.5rem;
                color: #654321;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .fun-modal-close:hover {
                background: #654321;
                color: #FEFDF8;
                transform: rotate(90deg);
            }

            .fun-menu {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin-top: 2rem;
            }

            .fun-option {
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #E8D5C4;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .fun-option:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(101, 67, 33, 0.2);
                border-color: #654321;
            }

            .fun-option-icon {
                font-size: 3rem;
                color: #8B4513;
                margin-bottom: 1rem;
            }

            .fun-option-title {
                font-family: 'Playfair Display', serif;
                font-size: 1.3rem;
                color: #654321;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .fun-option-desc {
                font-size: 0.9rem;
                color: #8B4513;
                opacity: 0.8;
            }

            /* Spin the Wheel */
            .wheel-container {
                position: relative;
                width: 350px;
                height: 350px;
                margin: 2rem auto;
            }

            .wheel {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 8px solid #654321;
                position: relative;
                transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
                box-shadow: 0 10px 40px rgba(101, 67, 33, 0.3);
                overflow: hidden;
            }

            .wheel-segment {
                position: absolute;
                width: 50%;
                height: 50%;
                left: 50%;
                top: 50%;
                transform-origin: 0% 0%;
                display: flex;
                align-items: flex-start;
                justify-content: flex-start;
                padding: 10px 20px;
                font-weight: 600;
                font-size: 0.85rem;
                color: #FEFDF8;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .wheel-segment span {
                display: block;
                width: 100%;
                text-align: left;
            }

            .wheel-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #654321, #8B4513);
                border-radius: 50%;
                border: 4px solid #F5E6D3;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: #FEFDF8;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 5px 20px rgba(101, 67, 33, 0.4);
                transition: all 0.3s ease;
            }

            .wheel-center:hover {
                transform: translate(-50%, -50%) scale(1.1);
            }

            .wheel-pointer {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 20px solid transparent;
                border-right: 20px solid transparent;
                border-top: 30px solid #654321;
                z-index: 20;
            }

            .spin-result {
                text-align: center;
                margin-top: 2rem;
                padding: 1.5rem;
                background: rgba(139, 69, 19, 0.1);
                border-radius: 15px;
                display: none;
            }

            .spin-result.show {
                display: block;
                animation: slideUp 0.5s ease;
            }

            .spin-result-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .spin-result-text {
                font-family: 'Playfair Display', serif;
                font-size: 1.5rem;
                color: #654321;
                margin-bottom: 0.5rem;
            }

            /* Quiz */
            .quiz-container {
                margin-top: 2rem;
            }

            .quiz-question {
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 20px;
                margin-bottom: 1.5rem;
                border: 2px solid #E8D5C4;
            }

            .quiz-question-text {
                font-family: 'Playfair Display', serif;
                font-size: 1.3rem;
                color: #654321;
                margin-bottom: 1.5rem;
            }

            .quiz-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .quiz-option {
                background: #FFFFFF;
                border: 2px solid #E8D5C4;
                padding: 1rem;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .quiz-option:hover {
                border-color: #8B4513;
                background: #F5E6D3;
                transform: translateX(5px);
            }

            .quiz-option-icon {
                font-size: 1.5rem;
            }

            .quiz-result {
                background: linear-gradient(135deg, #654321, #8B4513);
                color: #FEFDF8;
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
                display: none;
            }

            .quiz-result.show {
                display: block;
                animation: slideUp 0.5s ease;
            }

            .quiz-result-coffee {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .quiz-result-title {
                font-family: 'Playfair Display', serif;
                font-size: 2rem;
                margin-bottom: 1rem;
            }

            .quiz-result-desc {
                font-size: 1.1rem;
                line-height: 1.6;
                opacity: 0.9;
            }

            /* Dark Mode Toggle */
            .dark-mode-panel {
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
            }

            .dark-mode-toggle {
                position: relative;
                width: 80px;
                height: 40px;
                background: #E8D5C4;
                border-radius: 25px;
                cursor: pointer;
                transition: background 0.3s ease;
                margin: 1.5rem auto;
            }

            .dark-mode-toggle.active {
                background: #654321;
            }

            .dark-mode-slider {
                position: absolute;
                top: 4px;
                left: 4px;
                width: 32px;
                height: 32px;
                background: #FFFFFF;
                border-radius: 50%;
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }

            .dark-mode-toggle.active .dark-mode-slider {
                transform: translateX(40px);
            }

            /* Dark Mode Styles - Enhanced Aesthetic */
            body.dark-mode {
                background: 
                    radial-gradient(circle at 20% 50%, rgba(139, 89, 58, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(101, 67, 33, 0.06) 0%, transparent 50%),
                    linear-gradient(135deg, #0a0806 0%, #1a1410 50%, #0f0b08 100%) !important;
                color: #E8D5C4 !important;
                transition: all 0.5s ease;
            }

            /* Animated gradient background */
            body.dark-mode::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(ellipse at 10% 20%, rgba(245, 221, 184, 0.03) 0%, transparent 40%),
                    radial-gradient(ellipse at 90% 80%, rgba(166, 110, 66, 0.04) 0%, transparent 40%);
                pointer-events: none;
                z-index: 1;
                animation: gradientShift 20s ease infinite;
            }

            @keyframes gradientShift {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
            }

            body.dark-mode .navbar {
                background: rgba(15, 11, 8, 0.85) !important;
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border-bottom: 1px solid rgba(245, 221, 184, 0.1) !important;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6) !important;
            }

            body.dark-mode .nav-logo {
                color: #F5DDB8 !important;
                text-shadow: 0 0 20px rgba(245, 221, 184, 0.3), 0 0 40px rgba(245, 221, 184, 0.1);
            }
            
            body.dark-mode .section-title {
                color: #F5DDB8 !important;
                text-shadow: 0 4px 20px rgba(245, 221, 184, 0.3);
                background: linear-gradient(135deg, #F5DDB8 0%, #E8D5C4 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            body.dark-mode .nav-links a {
                color: #D4B896 !important;
                position: relative;
            }
            
            body.dark-mode .nav-links a::after {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 0;
                width: 0;
                height: 2px;
                background: linear-gradient(90deg, #F5DDB8, #8B5939);
                transition: width 0.3s ease;
            }
            
            body.dark-mode .nav-links a:hover::after {
                width: 100%;
            }
            
            body.dark-mode .nav-links a:hover,
            body.dark-mode .nav-links a.active {
                color: #F5DDB8 !important;
                text-shadow: 0 0 10px rgba(245, 221, 184, 0.5);
            }

            body.dark-mode .hero,
            body.dark-mode .menu-hero,
            body.dark-mode .library-hero,
            body.dark-mode .booking-hero{
                filter: brightness(0.65) contrast(1.15) saturate(0.9);
                position: relative;
            }

            body.dark-mode .hero::after,
            body.dark-mode .menu-hero::after,
            body.dark-mode .library-hero::after,
            body.dark-mode .booking-hero::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at center, transparent 0%, rgba(10, 8, 6, 0.4) 100%);
                pointer-events: none;
            }

            body.dark-mode .about-section,
            body.dark-mode .events-section,
            body.dark-mode .library-section,
            body.dark-mode .menu-section {
                background: 
                    radial-gradient(circle at 30% 20%, rgba(139, 89, 58, 0.05) 0%, transparent 50%),
                    linear-gradient(180deg, #0f0b08 0%, #1a1410 50%, #0f0b08 100%) !important;
                position: relative;
            }

            body.dark-mode .feature-card,
            body.dark-mode .event-card,
            body.dark-mode .book-card,
            body.dark-mode .menu-item, 
            body.dark-mode .booking-card {
                background: 
                    linear-gradient(135deg, rgba(31, 24, 18, 0.9) 0%, rgba(42, 32, 22, 0.9) 100%) !important;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(245, 221, 184, 0.15) !important;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.5),
                    inset 0 1px 0 rgba(245, 221, 184, 0.1) !important;
                position: relative;
                overflow: hidden;
            }

            body.dark-mode .feature-card::before,
            body.dark-mode .event-card::before,
            body.dark-mode .book-card::before,
            body.dark-mode .menu-item::before,
            body.dark-mode .booking-card::before
             {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(245, 221, 184, 0.03) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            body.dark-mode .feature-card:hover::before,
            body.dark-mode .event-card:hover::before,
            body.dark-mode .book-card:hover::before,
            body.dark-mode .menu-item:hover::before,
            body.dark-mode .booking-card:hover::before
            {
                opacity: 1;
            }

            body.dark-mode .feature-card:hover,
            body.dark-mode .event-card:hover,
            body.dark-mode .book-card:hover,
            body.dark-mode .menu-item:hover,
            body.dark-mode .booking-card:hover {
                background: 
                    linear-gradient(135deg, rgba(42, 32, 22, 0.95) 0%, rgba(52, 40, 24, 0.95) 100%) !important;
                box-shadow: 
                    0 12px 48px rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(245, 221, 184, 0.3),
                    inset 0 1px 0 rgba(245, 221, 184, 0.2),
                    0 0 40px rgba(245, 221, 184, 0.1) !important;
                transform: translateY(-8px) scale(1.01);
                border-color: rgba(245, 221, 184, 0.3) !important;
            }

            body.dark-mode .about-text,
            body.dark-mode .feature-card p,
            body.dark-mode .event-card p,
            body.dark-mode .book-description,
            body.dark-mode .item-description,
            body.dark-mode .event-date,
            body.dark-mode .book-author {
                color: #C9B698 !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            body.dark-mode .feature-card h4,
            body.dark-mode .event-card h4,
            body.dark-mode .book-title,
            body.dark-mode .item-name,
            body.dark-mode .about-text h3 {
                color: #F5DDB8 !important;
                text-shadow: 0 2px 10px rgba(245, 221, 184, 0.2);
            }

            body.dark-mode .feature-icon,
            body.dark-mode .event-icon {
                filter: brightness(1.1) drop-shadow(0 0 10px rgba(245, 221, 184, 0.3));
            }

            body.dark-mode .item-image {
                filter: brightness(0.9) contrast(1.1);
                border: 1px solid rgba(245, 221, 184, 0.1);
            }

            body.dark-mode .visual-item {
                background: linear-gradient(135deg, rgba(42, 32, 22, 0.8) 0%, rgba(52, 40, 24, 0.8) 100%) !important;
                border: 1px solid rgba(139, 89, 58, 0.3);
                backdrop-filter: blur(10px);
                box-shadow: inset 0 1px 0 rgba(245, 221, 184, 0.1);
            }

            body.dark-mode .login-section,
            body.dark-mode .featured-section {
                background: 
                    radial-gradient(ellipse at 50% 50%, rgba(139, 89, 58, 0.08) 0%, transparent 60%),
                    linear-gradient(135deg, #1a1410 0%, #0f0b08 50%, #1a1410 100%) !important;
            }

            body.dark-mode .login-card,
            body.dark-mode .featured-card {
                background: rgba(31, 24, 18, 0.85) !important;
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(245, 221, 184, 0.15) !important;
                box-shadow: 
                    0 10px 40px rgba(0, 0, 0, 0.6),
                    inset 0 1px 0 rgba(245, 221, 184, 0.1) !important;
            }

            body.dark-mode .login-card h3,
            body.dark-mode .featured-card h3 {
                color: #F5DDB8 !important;
                text-shadow: 0 2px 10px rgba(245, 221, 184, 0.2);
            }

            body.dark-mode .form-group label {
                color: #D4B896 !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            body.dark-mode .form-group input {
                background: rgba(42, 32, 22, 0.7) !important;
                border: 1px solid rgba(245, 221, 184, 0.2) !important;
                color: #E8D5C4 !important;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            body.dark-mode .form-group input:focus {
                background: rgba(52, 40, 24, 0.8) !important;
                border-color: #8B5939 !important;
                box-shadow: 
                    inset 0 2px 4px rgba(0, 0, 0, 0.3),
                    0 0 0 3px rgba(139, 89, 58, 0.2) !important;
            }

            body.dark-mode .contact-section,
            body.dark-mode .community-section {
                background: 
                    radial-gradient(ellipse at 30% 50%, rgba(139, 89, 58, 0.1) 0%, transparent 60%),
                    linear-gradient(135deg, #0a0806 0%, #1a1410 100%) !important;
            }

            body.dark-mode .newsletter,
            body.dark-mode .ambient-panel,
            body.dark-mode .dark-mode-panel {
                background: rgba(31, 24, 18, 0.5) !important;
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(245, 221, 184, 0.15) !important;
                box-shadow: inset 0 1px 0 rgba(245, 221, 184, 0.1);
            }

            body.dark-mode .newsletter input {
                background: rgba(42, 32, 22, 0.7) !important;
                border: 1px solid rgba(245, 221, 184, 0.2) !important;
                color: #E8D5C4 !important;
            }

            body.dark-mode .pairing-suggestion,
            body.dark-mode .pairing-info {
                background: rgba(139, 89, 58, 0.12) !important;
                border: 1px solid rgba(245, 221, 184, 0.2) !important;
                backdrop-filter: blur(10px);
            }

            body.dark-mode .ingredient-tag,
            body.dark-mode .book-genre {
                background: rgba(139, 89, 58, 0.25) !important;
                color: #F5DDB8 !important;
                border: 1px solid rgba(245, 221, 184, 0.2);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            body.dark-mode .filter-section,
            body.dark-mode .search-section {
                background: rgba(15, 11, 8, 0.9) !important;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(245, 221, 184, 0.1) !important;
            }

            body.dark-mode .filter-btn,
            body.dark-mode .genre-btn {
                background: rgba(31, 24, 18, 0.7) !important;
                border: 1px solid rgba(245, 221, 184, 0.2) !important;
                color: #D4B896 !important;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }

            body.dark-mode .filter-btn::before,
            body.dark-mode .genre-btn::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(245, 221, 184, 0.1);
                transform: translate(-50%, -50%);
                transition: width 0.3s ease, height 0.3s ease;
            }

            body.dark-mode .filter-btn:hover::before,
            body.dark-mode .genre-btn:hover::before {
                width: 300px;
                height: 300px;
            }

            body.dark-mode .filter-btn:hover,
            body.dark-mode .filter-btn.active,
            body.dark-mode .genre-btn:hover,
            body.dark-mode .genre-btn.active {
                background: linear-gradient(135deg, #8B5939, #A66E42) !important;
                border-color: #F5DDB8 !important;
                color: #FEFDF8 !important;
                box-shadow: 0 0 20px rgba(245, 221, 184, 0.3);
            }

            body.dark-mode .search-input {
                background: rgba(31, 24, 18, 0.8) !important;
                border: 1px solid rgba(245, 221, 184, 0.2) !important;
                color: #E8D5C4 !important;
            }

            body.dark-mode .search-input::placeholder {
                color: rgba(212, 184, 150, 0.5) !important;
            }

            body.dark-mode .cart-sidebar {
                background: rgba(26, 20, 16, 0.95) !important;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                box-shadow: -5px 0 40px rgba(0, 0, 0, 0.7) !important;
            }

            body.dark-mode .stat-box {
                background: rgba(31, 24, 18, 0.7) !important;
                border: 1px solid rgba(245, 221, 184, 0.2) !important;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }

            body.dark-mode .category-card {
                background: linear-gradient(135deg, rgba(31, 24, 18, 0.8) 0%, rgba(42, 32, 22, 0.8) 100%) !important;
                border: 1px solid rgba(245, 221, 184, 0.15) !important;
                backdrop-filter: blur(10px);
            }

            /* Amber glow effects */
            body.dark-mode .cta-btn,
            body.dark-mode .login-btn,
            body.dark-mode .event-btn,
            body.dark-mode .add-to-cart,
            body.dark-mode .reserve-btn {
                box-shadow: 0 4px 20px rgba(139, 89, 58, 0.4) !important;
                position: relative;
                overflow: hidden;
            }

            body.dark-mode .cta-btn::before,
            body.dark-mode .login-btn::before,
            body.dark-mode .event-btn::before,
            body.dark-mode .add-to-cart::before,
            body.dark-mode .reserve-btn::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(245, 221, 184, 0.2) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            body.dark-mode .cta-btn:hover::before,
            body.dark-mode .login-btn:hover::before,
            body.dark-mode .event-btn:hover::before,
            body.dark-mode .add-to-cart:hover::before,
            body.dark-mode .reserve-btn:hover::before {
                opacity: 1;
            }

            body.dark-mode .cta-btn:hover,
            body.dark-mode .login-btn:hover,
            body.dark-mode .event-btn:hover,
            body.dark-mode .add-to-cart:hover,
            body.dark-mode .reserve-btn:hover {
                box-shadow: 
                    0 8px 30px rgba(245, 221, 184, 0.5),
                    0 0 40px rgba(245, 221, 184, 0.2) !important;
            }

            /* Smooth transitions */
            body.dark-mode * {
                transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
            }

            /* Special scrollbar styling for dark mode */
            body.dark-mode ::-webkit-scrollbar {
                width: 10px;
            }

            body.dark-mode ::-webkit-scrollbar-track {
                background: rgba(15, 11, 8, 0.5);
            }

            body.dark-mode ::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #8B5939, #654321);
                border-radius: 5px;
            }

            body.dark-mode ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #A66E42, #8B5939);
            }

            body.dark-mode .filter-section,
            body.dark-mode .search-section {
                background: rgba(15, 11, 8, 0.95) !important;
                border-bottom-color: rgba(139, 89, 58, 0.3) !important;
            }

            body.dark-mode .filter-btn,
            body.dark-mode .genre-btn {
                background: rgba(31, 24, 18, 0.8) !important;
                border-color: rgba(139, 89, 58, 0.4) !important;
                color: #D4B896 !important;
            }

            body.dark-mode .filter-btn:hover,
            body.dark-mode .filter-btn.active,
            body.dark-mode .genre-btn:hover,
            body.dark-mode .genre-btn.active {
                background: linear-gradient(135deg, #8B5939, #A66E42) !important;
                border-color: #A66E42 !important;
                color: #FEFDF8 !important;
            }

            body.dark-mode .search-input {
                background: rgba(31, 24, 18, 0.9) !important;
                border-color: rgba(139, 89, 58, 0.4) !important;
                color: #E8D5C4 !important;
            }

            body.dark-mode .search-input::placeholder {
                color: rgba(212, 184, 150, 0.6) !important;
            }

            body.dark-mode .cart-sidebar {
                background: #1a1410 !important;
                box-shadow: -5px 0 40px rgba(0, 0, 0, 0.7) !important;
            }

            body.dark-mode .cart-title {
                color: #F5DDB8 !important;
            }

            body.dark-mode .cart-item {
                border-bottom-color: rgba(139, 89, 58, 0.2) !important;
            }

            body.dark-mode .stat-box {
                background: rgba(31, 24, 18, 0.8) !important;
                border-color: rgba(139, 89, 58, 0.3) !important;
            }

            body.dark-mode .stat-number {
                color: #F5DDB8 !important;
            }

            body.dark-mode .stat-label {
                color: #C9B698 !important;
            }

            body.dark-mode .category-card {
                background: linear-gradient(135deg, #1f1812 0%, #2a2016 100%) !important;
                border-color: rgba(139, 89, 58, 0.3) !important;
            }

            body.dark-mode .category-card:hover {
                background: linear-gradient(135deg, #2a2016 0%, #342818 100%) !important;
                box-shadow: 0 15px 40px rgba(245, 221, 184, 0.15) !important;
            }

            body.dark-mode .sound-control {
                background: rgba(31, 24, 18, 0.8) !important;
                border-color: rgba(139, 89, 58, 0.4) !important;
            }

            body.dark-mode .sound-control:hover {
                background: rgba(42, 32, 22, 0.9) !important;
                border-color: #8B5939 !important;
            }

            body.dark-mode .reading-corner {
                background: linear-gradient(135deg, #1a1410 0%, #0f0b08 100%) !important;
            }

            /* Amber glow effect for dark mode */
            body.dark-mode .cta-btn,
            body.dark-mode .login-btn,
            body.dark-mode .event-btn,
            body.dark-mode .add-to-cart,
            body.dark-mode .reserve-btn {
                box-shadow: 0 4px 20px rgba(139, 89, 58, 0.3) !important;
            }

            body.dark-mode .cta-btn:hover,
            body.dark-mode .login-btn:hover,
            body.dark-mode .event-btn:hover,
            body.dark-mode .add-to-cart:hover,
            body.dark-mode .reserve-btn:hover {
                box-shadow: 0 8px 30px rgba(245, 221, 184, 0.4) !important;
            }

            /* Smooth transition for all elements */
            body.dark-mode * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }

            /* Ambient Sound Controls */
            .ambient-panel {
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 20px;
            }

            .sound-control {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                background: #FEFDF8;
                border: 2px solid #E8D5C4;
                border-radius: 12px;
                margin-bottom: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .sound-control:hover {
                border-color: #8B4513;
                background: #F5E6D3;
            }

            .sound-control.active {
                border-color: #654321;
                background: linear-gradient(135deg, #F5E6D3, #E8D5C4);
            }

            .sound-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .sound-icon {
                font-size: 1.5rem;
                color: #8B4513;
            }

            .sound-toggle {
                width: 50px;
                height: 26px;
                background: #E8D5C4;
                border-radius: 13px;
                position: relative;
                transition: background 0.3s ease;
            }

            .sound-control.active .sound-toggle {
                background: #654321;
            }

            .sound-toggle-slider {
                position: absolute;
                top: 3px;
                left: 3px;
                width: 20px;
                height: 20px;
                background: #FFFFFF;
                border-radius: 50%;
                transition: transform 0.3s ease;
            }

            .sound-control.active .sound-toggle-slider {
                transform: translateX(24px);
            }

            .volume-control {
                margin-top: 1.5rem;
            }

            .volume-slider {
                width: 100%;
                height: 6px;
                background: #E8D5C4;
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
            }

            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                background: #654321;
                border-radius: 50%;
                cursor: pointer;
            }

            .volume-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #654321;
                border-radius: 50%;
                cursor: pointer;
                border: none;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .floating-cookie-btn {
                    width: 60px;
                    height: 60px;
                    bottom: 7rem;
                    right: 1.5rem;
                }

                .fun-menu {
                    grid-template-columns: 1fr;
                }

                .wheel-container {
                    width: 280px;
                    height: 280px;
                }

                .fun-modal-content {
                    padding: 2rem;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Create floating button with drag functionality
    function createFloatingButton() {
        const button = document.createElement('div');
        button.className = 'floating-cookie-btn';
        button.innerHTML = '🍪';
        button.title = 'Drag me anywhere! Click for Fun Features!';
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        button.addEventListener('mousedown', dragStart);
        button.addEventListener('touchstart', dragStart);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);

        function dragStart(e) {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === button) {
                isDragging = true;
                button.style.animation = 'none';
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, button);
            }
        }

        function dragEnd(e) {
            if (isDragging) {
                isDragging = false;
                button.style.animation = 'float 3s ease-in-out infinite';
                
                // Save position
                localStorage.setItem('cookieButtonX', xOffset);
                localStorage.setItem('cookieButtonY', yOffset);
                
                // If barely moved, treat as click
                if (Math.abs(xOffset - (parseFloat(localStorage.getItem('cookieButtonX')) || 0)) < 5 &&
                    Math.abs(yOffset - (parseFloat(localStorage.getItem('cookieButtonY')) || 0)) < 5) {
                    setTimeout(() => openFunModal(), 100);
                }
            }
        }

        function setTranslate(xPos, yPos, el) {
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    
    // Calculate safe boundaries - keep button visible
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;
    
    // Ensure button stays within viewport
    const safeX = Math.max(20, Math.min(xPos, maxX));
    const safeY = Math.max(20, Math.min(yPos, maxY));
    
    el.style.left = `${safeX}px`;
    el.style.top = `${safeY}px`;
}

        // Restore saved position

  const savedX = parseFloat(localStorage.getItem('cookieButtonX')) || 0;
const savedY = parseFloat(localStorage.getItem('cookieButtonY')) || 0;

// Ensure saved positions are within viewport
const maxX = window.innerWidth - 80;
const maxY = window.innerHeight - 80;

const safeX = Math.max(20, Math.min(savedX, maxX));
const safeY = Math.max(20, Math.min(savedY, maxY));

if (safeX !== 0 || safeY !== 0) {
    xOffset = safeX;
    yOffset = safeY;
    setTranslate(safeX, safeY, button);
}  document.body.appendChild(button);
}

    // Open fun modal
    function openFunModal() {
        const modal = document.createElement('div');
        modal.className = 'fun-modal active';
        modal.innerHTML = `
            <div class="fun-modal-content">
                <button class="fun-modal-close" onclick="this.closest('.fun-modal').remove()">×</button>
                <h2 style="font-family: 'Playfair Display', serif; color: #654321; text-align: center; margin-bottom: 0.5rem; font-size: 2.5rem;">Fun Corner</h2>
                <p style="text-align: center; color: #8B4513; margin-bottom: 2rem;">Make your Crumbelore experience even more delightful!</p>
                
                <div class="fun-menu">
                    <div class="fun-option" onclick="window.funFeatures.openSpinWheel()">
                        <div class="fun-option-icon">🎡</div>
                        <div class="fun-option-title">Spin the Wheel</div>
                        <div class="fun-option-desc">Win prizes & surprises!</div>
                    </div>
                    
                    <div class="fun-option" onclick="window.funFeatures.openMoodQuiz()">
                        <div class="fun-option-icon">☕</div>
                        <div class="fun-option-title">Coffee Quiz</div>
                        <div class="fun-option-desc">Find your perfect brew</div>
                    </div>
                    
                    <div class="fun-option" onclick="window.funFeatures.openDarkMode()">
                        <div class="fun-option-icon">🌙</div>
                        <div class="fun-option-title">Dark Mode</div>
                        <div class="fun-option-desc">Cozy reading ambiance</div>
                    </div>
                    
                    <div class="fun-option" onclick="window.funFeatures.openAmbientSound()">
                        <div class="fun-option-icon">🎵</div>
                        <div class="fun-option-title">Café Sounds</div>
                        <div class="fun-option-desc">ASMR atmosphere</div>
                    </div>
                </div>
            </div>
        `;
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    }

    // Spin the Wheel
    function openSpinWheel() {
        const prizes = [
            { text: '🍪 Free Cookie!', color: '#8B4513', emoji: '🎉', message: 'Congratulations! Enjoy a free cookie on us!' },
            { text: '📚 Free Bookmark', color: '#654321', emoji: '🎁', message: 'A beautiful bookmark is yours! Perfect for your next read.' },
            { text: '15% Discount', color: '#A0522D', emoji: '💰', message: 'Awesome! Get 15% off your next purchase!' },
            { text: '😢 Try Again', color: '#8B7355', emoji: '😔', message: 'Better luck next time! Come back tomorrow for another spin.' },
            { text: '☕ Free Latte', color: '#654321', emoji: '☕', message: 'Perfect! Enjoy a complimentary vanilla latte!' },
            { text: '🎂 Free Dessert', color: '#8B4513', emoji: '🍰', message: 'Sweet! Choose any dessert from our menu!' },
            { text: '10% Discount', color: '#A0522D', emoji: '🎊', message: 'Nice! Save 10% on your order today!' },
            { text: '😅 Almost!', color: '#8B7355', emoji: '💪', message: 'So close! Your luck is just around the corner!' }
        ];

        const modal = document.createElement('div');
        modal.className = 'fun-modal active';
        modal.innerHTML = `
            <div class="fun-modal-content">
                <button class="fun-modal-close" onclick="this.closest('.fun-modal').remove()">×</button>
                <h2 style="font-family: 'Playfair Display', serif; color: #654321; text-align: center; margin-bottom: 1rem; font-size: 2.2rem;">Spin the Wheel of Fortune!</h2>
                <p style="text-align: center; color: #8B4513; margin-bottom: 1rem;">Try your luck once per day!</p>
                
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <div class="wheel" id="spinWheel"></div>
                    <div class="wheel-center" onclick="window.funFeatures.spin()">
                        SPIN
                    </div>
                </div>
                
                <div class="spin-result" id="spinResult">
                    <div class="spin-result-icon"></div>
                    <div class="spin-result-text"></div>
                    <p style="color: #8B4513;"></p>
                </div>
            </div>
        `;

        // Create wheel segments with proper angles
        const wheel = modal.querySelector('#spinWheel');
        const segmentAngle = 360 / prizes.length;
        
        prizes.forEach((prize, i) => {
            const segment = document.createElement('div');
            segment.className = 'wheel-segment';
            segment.style.background = prize.color;
            segment.style.transform = `rotate(${i * segmentAngle}deg) skewY(-${90 - segmentAngle}deg)`;
            segment.innerHTML = `<span>${prize.text}</span>`;
            wheel.appendChild(segment);
        });

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.body.appendChild(modal);
    }

    function spin() {
        const wheel = document.getElementById('spinWheel');
        const result = document.getElementById('spinResult');
        const lastSpin = localStorage.getItem('lastSpin');
        const today = new Date().toDateString();

        if (lastSpin === today) {
            showNotification('You can only spin once per day! Come back tomorrow! 🍪', 'warning');
            return;
        }

        const prizes = [
            { text: 'Free Cookie!', emoji: '🎉', message: 'Congratulations! Enjoy a free cookie on us!' },
            { text: 'Free Bookmark', emoji: '🎁', message: 'A beautiful bookmark is yours!' },
            { text: '15% Discount', emoji: '💰', message: 'Awesome! Get 15% off!' },
            { text: 'Try Again', emoji: '😔', message: 'Better luck next time!' },
            { text: 'Free Latte', emoji: '☕', message: 'Enjoy a complimentary latte!' },
            { text: 'Free Dessert', emoji: '🍰', message: 'Choose any dessert!' },
            { text: '10% Discount', emoji: '🎊', message: 'Save 10% today!' },
            { text: 'Almost!', emoji: '💪', message: 'So close! Try tomorrow!' }
        ];

        const randomPrize = Math.floor(Math.random() * prizes.length);
        const rotations = 5;
        const segmentAngle = 360 / prizes.length;
        const finalRotation = (rotations * 360) + (randomPrize * segmentAngle) + (segmentAngle / 2);

        wheel.style.transform = `rotate(${finalRotation}deg)`;

        setTimeout(() => {
            const prize = prizes[randomPrize];
            result.querySelector('.spin-result-icon').textContent = prize.emoji;
            result.querySelector('.spin-result-text').textContent = prize.text;
            result.querySelector('p').textContent = prize.message;
            result.classList.add('show');
            
            localStorage.setItem('lastSpin', today);
            showNotification(`You won: ${prize.text}!`, 'success');
        }, 4000);
    }

    // Mood-based Coffee Quiz
    function openMoodQuiz() {
        const modal = document.createElement('div');
        modal.className = 'fun-modal active';
        modal.innerHTML = `
            <div class="fun-modal-content">
                <button class="fun-modal-close" onclick="this.closest('.fun-modal').remove()">×</button>
                <h2 style="font-family: 'Playfair Display', serif; color: #654321; text-align: center; margin-bottom: 1rem; font-size: 2.2rem;">What Should You Sip Today?</h2>
                <p style="text-align: center; color: #8B4513; margin-bottom: 2rem;">Answer a few questions to find your perfect reading companion!</p>
                
                <div class="quiz-container" id="quizContainer">
                    <div class="quiz-question">
                        <div class="quiz-question-text">1. What's your reading mood today?</div>
                        <div class="quiz-options">
                            <div class="quiz-option" data-answer="cozy">
                                <div class="quiz-option-icon">🛋️</div>
                                <div>Cozy & Comfortable</div>
                            </div>
                            <div class="quiz-option" data-answer="energetic">
                                <div class="quiz-option-icon">⚡</div>
                                <div>Energetic & Alert</div>
                            </div>
                            <div class="quiz-option" data-answer="calm">
                                <div class="quiz-option-icon">🧘</div>
                                <div>Calm & Contemplative</div>
                            </div>
                            <div class="quiz-option" data-answer="adventurous">
                                <div class="quiz-option-icon">🗺️</div>
                                <div>Adventurous & Bold</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quiz-question" style="display: none;">
                        <div class="quiz-question-text">2. What genre are you reading?</div>
                        <div class="quiz-options">
                            <div class="quiz-option" data-answer="romance">
                                <div class="quiz-option-icon">❤️</div>
                                <div>Romance</div>
                            </div>
                            <div class="quiz-option" data-answer="mystery">
                                <div class="quiz-option-icon">🔍</div>
                                <div>Mystery/Thriller</div>
                            </div>
                            <div class="quiz-option" data-answer="fantasy">
                                <div class="quiz-option-icon">🧙</div>
                                <div>Fantasy/Sci-Fi</div>
                            </div>
                            <div class="quiz-option" data-answer="nonfiction">
                                <div class="quiz-option-icon">📖</div>
                                <div>Non-Fiction</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quiz-question" style="display: none;">
                        <div class="quiz-question-text">3. When are you reading?</div>
                        <div class="quiz-options">
                            <div class="quiz-option" data-answer="morning">
                                <div class="quiz-option-icon">🌅</div>
                                <div>Morning (7-11 AM)</div>
                            </div>
                            <div class="quiz-option" data-answer="afternoon">
                                <div class="quiz-option-icon">☀️</div>
                                <div>Afternoon (12-5 PM)</div>
                            </div>
                            <div class="quiz-option" data-answer="evening">
                                <div class="quiz-option-icon">🌆</div>
                                <div>Evening (6-9 PM)</div>
                            </div>
                            <div class="quiz-option" data-answer="night">
                                <div class="quiz-option-icon">🌙</div>
                                <div>Late Night (10+ PM)</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="quiz-result" id="quizResult">
                    <div class="quiz-result-coffee">☕</div>
                    <div class="quiz-result-title"></div>
                    <div class="quiz-result-desc"></div>
                    <button class="event-btn" style="margin-top: 1.5rem;" onclick="this.closest('.fun-modal').remove(); window.location.href='menu.html';">Order Now</button>
                </div>
            </div>
        `;

        let answers = [];
        let currentQuestion = 0;
        const questions = modal.querySelectorAll('.quiz-question');
        const options = modal.querySelectorAll('.quiz-option');

        options.forEach(option => {
            option.onclick = () => {
                answers.push(option.dataset.answer);
                currentQuestion++;

                if (currentQuestion < questions.length) {
                    questions[currentQuestion - 1].style.display = 'none';
                    questions[currentQuestion].style.display = 'block';
                } else {
                    showQuizResult(modal, answers);
                }
            };
        });

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.body.appendChild(modal);
    }

    function showQuizResult(modal, answers) {
        const coffeeRecommendations = {
            'cozy-romance-morning': { name: 'Vanilla Dream Latte', icon: '☕', desc: 'Sweet, comforting, and perfect for romantic mornings. The Madagascar vanilla complements love stories beautifully.' },
            'cozy-romance-afternoon': { name: 'Caramel Macchiato', icon: '☕', desc: 'Indulgent and sweet - just like your afternoon romance novel. The caramel adds that extra touch of sweetness.' },
            'energetic-mystery-morning': { name: 'Classic Espresso', icon: '☕', desc: 'Bold and intense - perfect for solving mysteries at dawn. This will keep you alert through every twist!' },
            'energetic-mystery-afternoon': { name: 'Double Shot Americano', icon: '☕', desc: 'Strong and straightforward, ideal for afternoon detective work. No mysteries about this coffee!' },
            'calm-fantasy-evening': { name: 'Fantasy Forest Latte', icon: '☕', desc: 'Magical matcha blend that transports you to enchanted realms. Perfect for evening fantasy adventures.' },
            'calm-nonfiction-morning': { name: "Philosopher's Blend", icon: '☕', desc: 'Thoughtful medium roast designed for deep contemplation. Ideal for absorbing knowledge in the morning.' },
            'adventurous-fantasy-night': { name: 'Cosmic Mocha', icon: '☕', desc: 'Out-of-this-world chocolate and coffee fusion. Perfect for late-night sci-fi marathons!' },
            'cozy-mystery-night': { name: 'Dark Chocolate Mocha', icon: '☕', desc: 'Rich, mysterious, and comforting. The perfect companion for late-night thriller reading.' }
        };

        // Create a key from answers or use default
        const key = answers.slice(0, 3).join('-');
        let recommendation = coffeeRecommendations[key];
        
        // If no exact match, provide intelligent fallback
        if (!recommendation) {
            const mood = answers[0];
            const genre = answers[1] || 'mystery';
            
            if (mood === 'cozy') recommendation = { name: 'Vanilla Dream Latte', icon: '☕', desc: 'Sweet and comforting - perfect for your cozy reading session!' };
            else if (mood === 'energetic') recommendation = { name: 'Classic Espresso', icon: '☕', desc: 'Bold and energizing - keeps you alert and focused!' };
            else if (mood === 'calm') recommendation = { name: "Philosopher's Blend", icon: '☕', desc: 'Smooth and contemplative - ideal for peaceful reading!' };
            else recommendation = { name: 'Caramel Macchiato', icon: '☕', desc: 'Adventurous and delightful - perfect for your literary journey!' };
        }

        const resultContainer = modal.querySelector('#quizResult');
        const questionsContainer = modal.querySelector('#quizContainer');
        
        questionsContainer.style.display = 'none';
        resultContainer.querySelector('.quiz-result-coffee').textContent = recommendation.icon;
        resultContainer.querySelector('.quiz-result-title').textContent = recommendation.name;
        resultContainer.querySelector('.quiz-result-desc').textContent = recommendation.desc;
        resultContainer.classList.add('show');
        
        showNotification(`Your perfect coffee match: ${recommendation.name}!`, 'success');
    }

    // Dark Mode
    function openDarkMode() {
        const modal = document.createElement('div');
        modal.className = 'fun-modal active';
        
        const isDark = document.body.classList.contains('dark-mode');
        
        modal.innerHTML = `
            <div class="fun-modal-content">
                <button class="fun-modal-close" onclick="this.closest('.fun-modal').remove()">×</button>
                <h2 style="font-family: 'Playfair Display', serif; color: #654321; text-align: center; margin-bottom: 1rem; font-size: 2.2rem;">Reading Ambiance</h2>
                <p style="text-align: center; color: #8B4513; margin-bottom: 2rem;">Toggle between light and dark modes for your perfect reading environment</p>
                
                <div class="dark-mode-panel">
                    <div style="font-size: 4rem; margin-bottom: 1rem; transition: all 0.3s ease;">${isDark ? '🌙' : '☀️'}</div>
                    <h3 style="font-family: 'Playfair Display', serif; color: #654321; margin-bottom: 1rem; font-size: 1.8rem;">
                        ${isDark ? 'Dark Mode Active' : 'Light Mode Active'}
                    </h3>
                    <p style="color: #8B4513; margin-bottom: 1.5rem; line-height: 1.6;">
                        ${isDark ? 
                            'Cozy amber-lit ambiance for late-night reading. Easy on the eyes with warm, muted tones perfect for extended reading sessions.' : 
                            'Bright and clear for daytime reading. Crisp contrast and vibrant colors for optimal readability in well-lit environments.'}
                    </p>
                    
                    <div class="dark-mode-toggle ${isDark ? 'active' : ''}" onclick="window.funFeatures.toggleDarkMode(this)">
                        <div class="dark-mode-slider">
                            ${isDark ? '🌙' : '☀️'}
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(139, 69, 19, 0.1); border-radius: 12px; border: 1px solid rgba(139, 69, 19, 0.2);">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem;">
                            <span style="font-size: 1.2rem;">💡</span>
                            <strong style="color: #654321;">Features:</strong>
                        </div>
                        <ul style="color: #8B4513; margin-left: 1.5rem; line-height: 1.8;">
                            <li>Reduced eye strain for night reading</li>
                            <li>Warm amber glow effects</li>
                            <li>Perfect for low-light environments</li>
                            <li>Automatically saves your preference</li>
                        </ul>
                    </div>
                    
                    <p style="color: #8B4513; font-size: 0.9rem; margin-top: 1.5rem; opacity: 0.8; text-align: center;">
                        Your preference will be remembered across all pages
                    </p>
                </div>
            </div>
        `;

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.body.appendChild(modal);
    }

    function toggleDarkMode(toggle) {
        const isDark = document.body.classList.toggle('dark-mode');
        toggle.classList.toggle('active');
        toggle.querySelector('.dark-mode-slider').textContent = isDark ? '🌙' : '☀️';
        
        // modal text with animation
        const modal = toggle.closest('.fun-modal-content');
        const icon = modal.querySelector('.dark-mode-panel > div');
        const title = modal.querySelector('h3');
        const description = modal.querySelector('.dark-mode-panel > p');
        
        // Fade out
        icon.style.opacity = '0';
        title.style.opacity = '0';
        description.style.opacity = '0';
        
        setTimeout(() => {
            icon.textContent = isDark ? '🌙' : '☀️';
            title.textContent = isDark ? 'Dark Mode Active' : 'Light Mode Active';
            description.textContent = isDark ? 
                'Cozy amber-lit ambiance for late-night reading. Easy on the eyes with warm, muted tones perfect for extended reading sessions.' : 
                'Bright and clear for daytime reading. Crisp contrast and vibrant colors for optimal readability in well-lit environments.';
            
            // Fade in
            icon.style.opacity = '1';
            title.style.opacity = '1';
            description.style.opacity = '1';
        }, 300);
        
        // Save preference
        localStorage.setItem('darkMode', isDark);
        showNotification(`${isDark ? '🌙 Dark' : '☀️ Light'} mode activated! ${isDark ? 'Happy late-night reading!' : 'Enjoy your day!'}`, 'success');
    }

    function initializeDarkMode() {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    // Ambient Sound System
function openAmbientSound() {
    const modal = document.createElement('div');
    modal.className = 'fun-modal active';
    
    modal.innerHTML = `
        <div class="fun-modal-content">
            <button class="fun-modal-close" onclick="this.closest('.fun-modal').remove()">×</button>
            <h2 style="font-family: 'Playfair Display', serif; color: #654321; text-align: center; margin-bottom: 1rem; font-size: 2.2rem;">Café Ambiance</h2>
            <p style="text-align: center; color: #8B4513; margin-bottom: 2rem;">Create your perfect café atmosphere with ambient sounds</p>
            
            <div class="ambient-panel">
                <div class="sound-control" data-sound="coffee" onclick="window.funFeatures.toggleSound(this, 'coffee')">
                    <div class="sound-info">
                        <div class="sound-icon">☕</div>
                        <div>
                            <div style="color: #654321; font-weight: 600;">Coffee Brewing</div>
                            <div style="color: #8B4513; font-size: 0.85rem;">Espresso machine sounds</div>
                        </div>
                    </div>
                    <div class="sound-toggle">
                        <div class="sound-toggle-slider"></div>
                    </div>
                </div>
                
                <div class="sound-control" data-sound="pages" onclick="window.funFeatures.toggleSound(this, 'pages')">
                    <div class="sound-info">
                        <div class="sound-icon">📖</div>
                        <div>
                            <div style="color: #654321; font-weight: 600;">Page Turning</div>
                            <div style="color: #8B4513; font-size: 0.85rem;">Gentle rustling sounds</div>
                        </div>
                    </div>
                    <div class="sound-toggle">
                        <div class="sound-toggle-slider"></div>
                    </div>
                </div>
                
                <div class="sound-control" data-sound="ambience" onclick="window.funFeatures.toggleSound(this, 'ambience')">
                    <div class="sound-info">
                        <div class="sound-icon">🏪</div>
                        <div>
                            <div style="color: #654321; font-weight: 600;">Café Chatter</div>
                            <div style="color: #8B4513; font-size: 0.85rem;">Background conversations</div>
                        </div>
                    </div>
                    <div class="sound-toggle">
                        <div class="sound-toggle-slider"></div>
                    </div>
                </div>
                
                <div class="sound-control" data-sound="rain" onclick="window.funFeatures.toggleSound(this, 'rain')">
                    <div class="sound-info">
                        <div class="sound-icon">🌧️</div>
                        <div>
                            <div style="color: #654321; font-weight: 600;">Rain Sounds</div>
                            <div style="color: #8B4513; font-size: 0.85rem;">Cozy rainy day vibes</div>
                        </div>
                    </div>
                    <div class="sound-toggle">
                        <div class="sound-toggle-slider"></div>
                    </div>
                </div>
                
                <div class="volume-control">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #654321; font-weight: 600;">Master Volume</span>
                        <span style="color: #8B4513;" id="volumeValue">50%</span>
                    </div>
                    <input type="range" class="volume-slider" min="0" max="100" value="50" 
                           oninput="window.funFeatures.updateVolume(this.value)">
                </div>
                
                <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(139, 69, 19, 0.1); border-radius: 10px; border: 1px solid rgba(139, 69, 19, 0.2);">
                    <p style="color: #8B4513; font-size: 0.85rem; margin: 0; text-align: center;">
                        🔊 <strong>Note:</strong> Sounds require user interaction. Click any toggle to start.
                    </p>
                </div>
            </div>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
    
    // Restore saved states
    restoreSoundStates(modal);
}

//Toggle sound function with proper error handling
function toggleSound(element, soundType) {
    const isActive = element.classList.contains('active');
    
    if (isActive) {
        // Turning OFF
        element.classList.remove('active');
        stopSound(soundType);
        showNotification(`${soundType.charAt(0).toUpperCase() + soundType.slice(1)} sounds disabled`, 'info');
    } else {
        // Turning ON
        element.classList.add('active');
        const success = playSound(soundType);
        
        if (success) {
            showNotification(`${soundType.charAt(0).toUpperCase() + soundType.slice(1)} sounds enabled`, 'success');
        } else {
            element.classList.remove('active');
            showNotification('Could not play sound. Try clicking again.', 'warning');
        }
    }
    
    // Save state
    const soundStates = JSON.parse(localStorage.getItem('soundStates') || '{}');
    soundStates[soundType] = element.classList.contains('active');
    localStorage.setItem('soundStates', JSON.stringify(soundStates));
}

//  Audio file configuration 
const AUDIO_FILES = {
    coffee: 'sounds/coffee.mp3', 
    pages: 'sounds/pages.mp3',  
    ambience: 'sounds/ambience.mp3',
    rain: 'sounds/rain.mp3'
};

//  Play sound 
function playSound(soundType) {
    // Stop any existing sound first
    stopSound(soundType);
    
    // Get volume
    const volume = (parseFloat(localStorage.getItem('ambientVolume')) || 50) / 100;
    
    try {
        // Create audio element
        const audio = new Audio();
        audio.src = AUDIO_FILES[soundType];
        audio.loop = true;
        audio.volume = volume;
        
        // Store reference before playing
        if (!window.activeSounds) {
            window.activeSounds = {};
        }
        
        window.activeSounds[soundType] = {
            audio: audio,
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
            },
            setVolume: (vol) => {
                audio.volume = vol;
            }
        };
        
        // Attempt to play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Audio play failed:', error);
                stopSound(soundType);
                return false;
            });
        }
        
        return true;
    } catch (error) {
        console.error('Error creating audio:', error);
        return false;
    }
}

// Stop sound function
function stopSound(soundType) {
    if (window.activeSounds && window.activeSounds[soundType]) {
        try {
            const sound = window.activeSounds[soundType];
            if (sound.audio) {
                sound.audio.pause();
                sound.audio.currentTime = 0;
                sound.audio.src = '';
            }
            delete window.activeSounds[soundType];
        } catch (error) {
            console.error('Error stopping sound:', error);
        }
    }
}

// volume function
function updateVolume(value) {
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) {
        volumeValue.textContent = `${value}%`;
    }
    
    localStorage.setItem('ambientVolume', value);
    const volumeMultiplier = value / 100;
    
    //  volume for all active sounds
    if (window.activeSounds) {
        Object.keys(window.activeSounds).forEach(soundType => {
            const sound = window.activeSounds[soundType];
            if (sound && sound.setVolume) {
                sound.setVolume(volumeMultiplier);
            }
        });
    }
}

//  Restore sound states
function restoreSoundStates(modal) {
    const soundStates = JSON.parse(localStorage.getItem('soundStates') || '{}');
    const volume = localStorage.getItem('ambientVolume') || 50;
    
    // UI toggles
    Object.keys(soundStates).forEach(soundType => {
        if (soundStates[soundType]) {
            const control = modal.querySelector(`[data-sound="${soundType}"]`);
            if (control) {
                control.classList.add('active');
            }
        }
    });
    
    // volume slider
    const volumeSlider = modal.querySelector('.volume-slider');
    const volumeValue = modal.querySelector('#volumeValue');
    if (volumeSlider && volumeValue) {
        volumeSlider.value = volume;
        volumeValue.textContent = `${volume}%`;
    }
}

// Stop all sounds when leaving page
window.addEventListener('beforeunload', () => {
    if (window.activeSounds) {
        Object.keys(window.activeSounds).forEach(soundType => {
            stopSound(soundType);
        });
    }
});

// Initialize ambient sound system
function initializeAmbientSound() {
    // Just ensure the activeSounds object exists
    if (!window.activeSounds) {
        window.activeSounds = {};
    }
}

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColors = {
            success: 'linear-gradient(135deg, #654321, #654321)',
            error: 'linear-gradient(135deg, #f44336, #da190b)',
            info: 'linear-gradient(135deg, #654321, #8B4513)',
            warning: 'linear-gradient(135deg, #ff9800, #f57c00)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${bgColors[type]};
            color: white;
            padding: 1rem 2rem;
            border-radius: 15px;
            z-index: 5000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-weight: 500;
            max-width: 350px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Load user preferences
    function loadUserPreferences() {
        // Dark mode
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
        
        // Ambient sounds
        const soundStates = JSON.parse(localStorage.getItem('soundStates') || '{}');
        Object.keys(soundStates).forEach(soundType => {
            if (soundStates[soundType]) {
                playSound(soundType);
            }
        });
    }

    // Export functions to global scope
    window.funFeatures = {
        openSpinWheel,
        spin,
        openMoodQuiz,
        openDarkMode,
        toggleDarkMode,
        openAmbientSound,
        toggleSound,
        updateVolume
    };
})();