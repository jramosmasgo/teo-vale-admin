import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};

export default ThemeToggle;
