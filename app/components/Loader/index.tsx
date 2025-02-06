import { useEffect } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'l-grid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                size?: string;
                speed?: string;
                color?: string;
            };
        }
    }
}

const Loader = () => {
    useEffect(() => {
        const { grid } = require('ldrs');
        grid.register();
    }, []);

    return (
        <div className="flex h-screen items-center justify-center bg-white">
            <l-grid
                size="60"
                speed="1.5"
                color="black"
            ></l-grid>
        </div>
    );
};

export default Loader;