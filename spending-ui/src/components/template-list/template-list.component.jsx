import Template from "../template/template.component";

const TemplateList = ({templates}) => {
    console.log(templates);
    const templateList = templates.map((t) => {
        return {...t}
    })
    console.log("TemplateList: ", templateList);

    return (
        <div>
            <h1>Templates</h1>
            {templateList.map(item => <Template key={item.id} template={item}/>)}
        </div>
    )
};

export default TemplateList;
