import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Home = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFirstWorkspace = async () => {
            try {
                const res = await api.get('/workspaces');
                if (res.data.length > 0) {
                    // If workspaces exist, redirect to the first one
                    navigate(`/workspaces/${res.data[0]._id}`);
                } else {
                    // If no workspaces, redirect to the main boards page
                    navigate('/boards');
                }
            } catch (error) {
                console.error("Could not fetch workspaces", error);
                setLoading(false);
            }
        };

        getFirstWorkspace();
    }, [navigate]);

    return <div>{loading && 'Loading...'}</div>;
};

export default Home;