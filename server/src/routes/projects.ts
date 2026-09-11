import { Router } from 'express'
import { prisma } from '../db.js'
import { getUserFromRequest } from '../auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    include: { workspace: true },
    orderBy: { lastModified: 'desc' },
  })
  res.json(projects)
})

router.post('/', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const { name, language = 'javascript', workspaceId } = req.body as any
  if (!name) return res.status(400).json({ error: 'Name required' })

  let wsId = workspaceId
  if (!wsId) {
    let ws = await prisma.workspace.findFirst({ where: { ownerId: user.id, type: 'personal' } })
    if (!ws) ws = await prisma.workspace.create({ data: { name: 'Personal', type: 'personal', ownerId: user.id } })
    wsId = ws.id
  }

  const project = await prisma.project.create({
    data: { name, language, workspaceId: wsId, ownerId: user.id },
  })

  // Create default files
  const srcFolder = await prisma.file.create({
    data: { name: 'src', path: 'src', type: 'folder', projectId: project.id },
  })
  const lang = language || 'javascript'
  const entryFile = getEntryFile(lang)
  await prisma.file.create({
    data: {
      name: entryFile.name,
      path: `src/${entryFile.name}`,
      content: entryFile.content,
      type: 'file',
      parentId: srcFolder.id,
      projectId: project.id,
    },
  })
  await prisma.file.create({
    data: {
      name: 'README.md',
      path: 'README.md',
      content: `# ${name}\n\nA ${lang} project created with LokoCode IDE.\n`,
      type: 'file',
      projectId: project.id,
    },
  })

  res.json(project)
})

router.get('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { files: true, workspace: true },
  })
  if (!project || project.ownerId !== user.id) return res.status(404).json({ error: 'Not found' })
  res.json(project)
})

router.delete('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const project = await prisma.project.findUnique({ where: { id: req.params.id } })
  if (!project || project.ownerId !== user.id) return res.status(404).json({ error: 'Not found' })
  await prisma.project.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

router.patch('/:id', async (req, res) => {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const project = await prisma.project.findUnique({ where: { id: req.params.id } })
  if (!project || project.ownerId !== user.id) return res.status(404).json({ error: 'Not found' })
  const { name, language, gitRepo } = req.body as any
  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { name, language, gitRepo, lastModified: new Date() },
  })
  res.json(updated)
})

function getEntryFile(lang: string) {
  const templates: Record<string, { name: string; content: string }> = {
    javascript: { name: 'index.js', content: "console.log('Hello from LokoCode IDE!');\n" },
    typescript: { name: 'index.ts', content: "const greeting: string = 'Hello from LokoCode IDE!';\nconsole.log(greeting);\n" },
    python: { name: 'main.py', content: "def main():\n    print('Hello from LokoCode IDE!')\n\nif __name__ == '__main__':\n    main()\n" },
    react: { name: 'App.jsx', content: "export default function App() {\n  return <div>Hello LokoCode!</div>;\n}\n" },
    html: { name: 'index.html', content: '<!DOCTYPE html>\n<html><body><h1>Hello LokoCode!</h1></body></html>\n' },
    css: { name: 'style.css', content: 'body { font-family: sans-serif; }\n' },
    go: { name: 'main.go', content: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from LokoCode IDE!")\n}\n' },
    rust: { name: 'main.rs', content: 'fn main() {\n    println!("Hello from LokoCode IDE!");\n}\n' },
    java: { name: 'Main.java', content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from LokoCode IDE!");\n    }\n}\n' },
    cpp: { name: 'main.cpp', content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from LokoCode IDE!" << std::endl;\n    return 0;\n}\n' },
    c: { name: 'main.c', content: '#include <stdio.h>\n\nint main() {\n    printf("Hello from LokoCode IDE!\\n");\n    return 0;\n}\n' },
  }
  return templates[lang] || templates.javascript
}

export default router
