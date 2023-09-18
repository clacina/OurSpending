import Template from "../template/template.component";

const TemplateList = ({templates}) => {
    const templateList = templates.map((t) => {
        return {...t}
    })

    return (
        <div>
            <h1>Templates</h1>
            {templateList.map(item => <Template key={item.id} template={item}/>)}
        </div>
    )
};

export default TemplateList;
