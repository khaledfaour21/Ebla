"use client"

import Image from "next/image"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jan',
    الدخل: 4000,
    المصروفات: 2400,
    
  },
  {
    name: 'Feb',
    الدخل: 3000,
    المصروفات: 1398,
    
  },
  {
    name: 'Mar',
    الدخل: 2000,
    المصروفات: 9800,
    
  },
  {
    name: 'Apr',
    الدخل: 2780,
    المصروفات: 3908,
    
  },
  {
    name: 'May',
    الدخل: 1890,
    المصروفات: 4800,
    
  },
  {
    name: 'Jun',
    الدخل: 2390,
    المصروفات: 3800,
    
  },
  {
    name: 'Jul',
    الدخل: 3490,
    المصروفات: 4300,
    
  },
  {
    name: 'Aug',
    الدخل: 3490,
    المصروفات: 4300,
    
  },
  {
    name: 'Sep',
    الدخل: 3490,
    المصروفات: 4300,
    
  },
  {
    name: 'Oct',
    الدخل: 3490,
    المصروفات: 4300,
    
  },
  {
    name: 'Nov',
    الدخل: 3490,
    المصروفات: 4300,
    
  },
  {
    name: 'Dec',
    الدخل: 3490,
    المصروفات: 4300,
    
  },
];


const FinanceChart = () => {
    return (
        <div className='bg-white rounded-xl w-full h-full p-4'>
            <div className="flex justify-between items-center">
            <Image src="/moreDark.png" alt='' width={20} height={20} className='justify-start'/>
            <h1 className='text-lg font-semibold'>المالية</h1>
            </div> 
            <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd"/>
          <XAxis dataKey="name" axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} tickMargin={10}/>
          <YAxis axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} tickMargin={20}/>
          <Tooltip />
          <Legend align='center' verticalAlign='top' wrapperStyle={{paddingTop:"10px",paddingBottom:"30px"}}/>
          <Line type="monotone" dataKey="الدخل" stroke="#C3EBFA" strokeWidth={5} />
          <Line type="monotone" dataKey="المصروفات" stroke="#CFCEFF" strokeWidth={5}/>
        </LineChart>
      </ResponsiveContainer>
            
        </div>
    );
};

export default FinanceChart