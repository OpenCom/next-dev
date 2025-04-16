"use client"
import { useEffect, useState } from 'react';
import Wrapper from '@/components/dashboard/Wrapper';
import Summary from '@/components/dashboard/Summary';
import Grid from '@/components/dashboard/Grid';

export default function Dashboard() {
  const [data, setData] = useState({ totalTrasferte: 0, totalSpese: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/dashboard');
      const res = await response.json();
      setData(res.results);
    };
    fetchData();
  }, []);

  return (
    <Wrapper onEdit={() => {}} onAdd={() => {}}>
      <Summary totalTrasferte={data.totalTrasferte} totalSpese={data.totalSpese} />
      <Grid />
    </Wrapper>
  );
};