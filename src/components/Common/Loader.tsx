import React from 'react';

const Loader: React.FC = () => (
    
    <div className="flex justify-center items-center h-full min-h-20">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
    </div>
);

export default Loader;
