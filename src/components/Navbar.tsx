import React from 'react';

const Navbar = () => {
    // Replace imageUrl with the actual URL of the image
    const imageUrl = 'https://www.torontomu.ca/content/dam/water/landing-page/waterlandingpage.png  ';

    return (
        <header
            className="h-16 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${imageUrl})` }}
            
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-400 opacity-50"></div>
        </header>
    );
};

export default Navbar;