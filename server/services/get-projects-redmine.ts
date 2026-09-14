interface Projects {
    id: number,
    name: string,
    description: string
}

async function GetProjectsRedmine(): Promise<Projects[]> {

    const headers: Headers = new Headers()

    headers.set("Content-Type", "application/json")
    headers.set("Accept", "application/json")

    headers.set("X-Redmine-API-Key", process.env.REDMINE_API_KEY ?? "")

    const response = await fetch('https://redmine.hiberus.com/redmine/projects.json', {
        method: "GET",
        headers: headers
    });
    
    if (!response.ok) {
        throw new Error('No se han podido cargar los proyectos de Redmine');
    }
    return (await response.json()).projects;
}