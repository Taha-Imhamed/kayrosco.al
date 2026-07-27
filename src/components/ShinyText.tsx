import React from 'react';
import { motion } from 'framer-motion';

interface ShinyTextProps {
    text: string;
    className?: string;
    baseColor?: string;
    shineColor?: string;
    speed?: number;
    spread?: number;
}

const ShinyText: React.FC<ShinyTextProps> = ({
    text,
    className = '',
    baseColor = '#58c7ff',
    shineColor = '#a78bfa',
    speed = 3,
    spread = 100,
}) => {
    return (
        <motion.span
            className={className}
            style={{
                backgroundImage: `linear-gradient(${spread}deg, ${baseColor} 35%, ${shineColor} 50%, ${baseColor} 65%)`,
                backgroundSize: '300% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
            }}
            animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
            transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        >
            {text}
        </motion.span>
    );
};

export default ShinyText;
