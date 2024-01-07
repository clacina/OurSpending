import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

const EntityList = ({nodes}) => {
    const data = { nodes };

    const theme = useTheme([
        getTheme(),
        {
            HeaderRow: `
        background-color: #eaf5fd;
      `,
            Row: `
        &:nth-of-type(odd) {
          background-color: #d2e9fb;
        }

        &:nth-of-type(even) {
          background-color: #eaf5fd;
        }
      `,
        },
    ]);

    const COLUMNS = [
        { label: 'Id', renderCell: (item) => item.id, resize: true },
        { label: 'Value', renderCell: (item) => item.value, resize: true },
    ];

    return <CompactTable columns={COLUMNS} data={data} theme={theme} />;
};

export default EntityList;
