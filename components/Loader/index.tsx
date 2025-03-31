import { useEffect } from 'react';
import DefaultLayout from '../Layouts/DefaultLayout';

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
        <DefaultLayout>
            <l-grid
                size="60"
                speed="1.5"
                color="black"
            ></l-grid>
        </DefaultLayout>
    );
};

export default Loader;