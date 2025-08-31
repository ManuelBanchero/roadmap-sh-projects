import readline from 'readline-sync'
const URL = 'https://api.github.com/users'

// Events types: https://docs.github.com/en/rest/using-the-rest-api/github-event-types?apiVersion=2022-11-28
// PushEvent - IssuesEvent - CreateEvent

async function main() {
    console.log('LASTEST GITHUB USER ACTIVITY\n')
    const username = readline.question('GitHub User: ')

    try {
        const res = await fetch(`${URL}/${username}/events`)

        if(!res.ok) throw new Error('Could not find the user')

        const data = await res.json()
        const lastUserActivity = data.slice(0, 10)

        lastUserActivity.forEach((activity, i) => {
            const repo = activity.repo.name
            switch(activity.type) {
                case 'CreateEvent': {
                    if(activity.payload.ref_type === 'repository')
                        console.log(`${i + 1}- Created a new repository: ${repo}`)

                    if(activity.payload.ref_type === 'branch')
                        console.log(`${i + 1}- Created a new branch: ${activity.payload.ref} on ${repo}`)

                    if(activity.payload.ref_type === 'tag')
                        console.log(`${i + 1}- Created a new tag: ${activity.payload.ref} on ${repo}`)

                    break
                }
                case 'IssuesEvent': {
                    console.log(`${i + 1}- Opened a new issue in ${repo}`)
                    break
                }
                case 'PushEvent': {
                    console.log(`${i + 1}- Pushed ${activity.payload.size} ${activity.payload.size === 1 ? 'commit' : 'commits'} to ${repo}`)
                    break
                }
                case 'IssueCommentEvent': {
                    console.log(`${i + 1}- Commented an issue in ${repo}`)
                    break
                }
                case 'WatchEvent': {
                    console.log(`${i + 1}- Gave a star to ${repo}`)
                    break
                }
                default: {
                    console.log(`${i + 1}- ${activity.type} is not handle it.`)
                    console.log(activity)
                    break
                }
            }
        })

    } catch(error) {
        console.error(error)
    }
}

main()