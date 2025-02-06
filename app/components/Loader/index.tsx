import { grid } from 'ldrs'
grid.register()

const Loader = () => {
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