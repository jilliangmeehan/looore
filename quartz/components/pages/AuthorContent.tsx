import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"

const numPages = 10
const AuthorContent: QuartzComponent = (props: QuartzComponentProps) => {
  const { tree, fileData, allFiles, cfg } = props
  const slug = fileData.slug

  if (!(slug?.startsWith("author/") || slug === "author")) {
    throw new Error(`Component "AuthorContent" tried to render a non-author page: ${slug}`)
  }

  const author = simplifySlug(slug.slice("author/".length) as FullSlug)
  const allPagesWithAuthor = (author: string) =>
    allFiles.filter((file) =>
      (file.frontmatter?.author ?? []).flatMap(getAllSegmentPrefixes).includes(author),
    )

  const content =
    (tree as Root).children.length === 0
      ? fileData.description
      : htmlToJsx(fileData.filePath!, tree)
  const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
  const classes = ["popover-hint", ...cssClasses].join(" ")
  if (author === "/") {
    const authors = [
      ...new Set(
        allFiles.flatMap((data) => data.frontmatter?.author ?? []).flatMap(getAllSegmentPrefixes),
      ),
    ].sort((a, b) => a.localeCompare(b))
    const authorItemMap: Map<string, QuartzPluginData[]> = new Map()
    for (const author of authors) {
      authorItemMap.set(author, allPagesWithAuthor(author))
    }
    return (
      <div class={classes}>
        <article>
          <p>{content}</p>
        </article>
        <p>{i18n(cfg.locale).pages.authorContent.totalAuthors({ count: authors.length })}</p>
        <div>
          {authors.map((author) => {
            const pages = authorItemMap.get(author)!
            const listProps = {
              ...props,
              allFiles: pages,
            }

            const contentPage = allFiles.filter((file) => file.slug === `author/${author}`).at(0)

            const root = contentPage?.htmlAst
            const content =
              !root || root?.children.length === 0
                ? contentPage?.description
                : htmlToJsx(contentPage.filePath!, root)

            return (
              <div>
                <h2>
                  <a class="internal author-link" href={`../author/${author}`}>
                    {author}
                  </a>
                </h2>
                {content && <p>{content}</p>}
                <div class="page-listing">
                  <p>
                    {i18n(cfg.locale).pages.authorContent.itemsUnderAuthor({ count: pages.length })}
                    {pages.length > numPages && (
                      <>
                        {" "}
                        <span>
                          {i18n(cfg.locale).pages.authorContent.showingFirst({ count: numPages })}
                        </span>
                      </>
                    )}
                  </p>
                  <PageList limit={numPages} {...listProps} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  } else {
    const pages = allPagesWithAuthor(author)
    const listProps = {
      ...props,
      allFiles: pages,
    }

    return (
      <div class={classes}>
        <article>{content}</article>
        <div class="page-listing">
          <p>{i18n(cfg.locale).pages.authorContent.itemsUnderAuthor({ count: pages.length })}</p>
          <div>
            <PageList {...listProps} />
          </div>
        </div>
      </div>
    )
  }
}

AuthorContent.css = style + PageList.css
export default (() => AuthorContent) satisfies QuartzComponentConstructor
