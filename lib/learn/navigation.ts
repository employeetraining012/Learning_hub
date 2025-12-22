import { CourseTree } from './course-tree'

export function computeNextPrev(tree: CourseTree, currentModuleId: string, currentContentId: string) {
    let prevItem = null
    let nextItem = null

    // Flatten the tree for easier traversal
    const flatItems = tree.modules.flatMap(m =>
        m.items.map(i => ({
            ...i,
            moduleId: m.id
        }))
    )

    const currentIndex = flatItems.findIndex(i => i.id === currentContentId)

    if (currentIndex !== -1) {
        if (currentIndex > 0) {
            const prev = flatItems[currentIndex - 1]
            prevItem = {
                moduleId: prev.moduleId,
                contentId: prev.id,
                title: prev.title
            }
        }

        if (currentIndex < flatItems.length - 1) {
            const next = flatItems[currentIndex + 1]
            nextItem = {
                moduleId: next.moduleId,
                contentId: next.id,
                title: next.title
            }
        }
    }

    return { prevItem, nextItem }
}
