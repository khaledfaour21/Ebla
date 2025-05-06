const Table = ({
    columns,
    renderRow,
    data
}:{
        columns:{header:string; accessor:string; className?:string}[];
        renderRow: (item: any) => React.ReactNode;
        data: any[];
    }) => {
    return (
        <table className="w-full mt-5" dir="rtl">
           <thead> 
            <tr className="text-left text-gray-500 text-sm">
                {columns.map((col)=>(
                    <th key={col.accessor} className={`${col.className} text-right`}>{col.header}</th>
                ))}
            </tr>
           </thead>
           <tbody>{data.map((item)=>renderRow(item))}</tbody>
        </table>
    )
}

export default Table