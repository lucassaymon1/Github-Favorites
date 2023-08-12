import { GithubUsers } from './GithubUsers.js'

// parte que trbalhará com a estrutura e lógica dos dados

export class Favorites {
	constructor(root) {
		this.root = document.querySelector(root)
		this.load()
	}
	load() {
		this.entries = JSON.parse(localStorage.getItem('@Github-Favorites:')) || []
	}

	delete(user) {
		const filteredEntries = this.entries.filter(
			(entry) => user.login !== entry.login
		)

		this.entries = filteredEntries
		this.save()
		this.update()
	}
}

// classe que criará e manipulará os elementos visuais do html

export class FavoritesView extends Favorites {
	constructor(root) {
		super(root)

		this.update()
		this.onAdd()
	}

	save() {
		localStorage.setItem('@Github-Favorites:', JSON.stringify(this.entries))
	}

	onAdd() {
		const addButton = document.querySelector('.search button')
		addButton.onclick = () => {
			const { value } = document.querySelector('.search input')
			if (value !== '') {
				this.addFav(value)
			}
		}
		document.addEventListener('keypress', function (e) {
			const { value } = document.querySelector('.search input')
			if (e.key === 'Enter') {
				if (value !== '') {
					addButton.click()
				}
			}
		})
	}

	async addFav(username) {
		const clearInput = document.querySelector('.search input')
		try {
			const userExists = this.entries.find((entry) => entry.login === username)

			if (userExists) {
				clearInput.value = ''
				throw new Error('Usuário já cadastrado')
			}

			const user = await GithubUsers.search(username)

			if (user.login === undefined) {
				throw new Error('O usuário não existe')
			} else {
				clearInput.value = ''
			}

			this.entries = [user, ...this.entries]
		} catch (error) {
			alert(error.message)
		}
		this.save()
		this.update()
	}
	update() {
		this.tbody = this.root.querySelector('table tbody')

		this.removeAllTr()

		this.noFavorites()
		this.entries.forEach((user) => {
			const row = this.createRow()

			row.querySelector('img').alt = `Imagem de ${user.name}`
			row.querySelector('.user a').href = `https://github.com/${user.login}`
			row.querySelector(
				'.user img'
			).src = `https://github.com/${user.login}.png`
			row.querySelector('.user p').textContent = user.name
			row.querySelector('.user span').textContent = `/${user.login}`
			row.querySelector('.followers').textContent = user.followers
			row.querySelector('.repos').textContent = user.public_repos

			row.querySelector('.remove').onclick = () => {
				this.delete(user)
			}
			this.tbody.append(row)
		})
	}

	removeAllTr() {
		this.tbody.querySelectorAll('tr').forEach((tr) => {
			tr.remove()
		})
	}

	createRow() {
		const tr = document.createElement('tr')

		tr.innerHTML = `
      <tr>
        <td>
        <img src="https://github.com/maykbrito.png" href="" alt="foto de Mayk Brito">
        <a href="https://github.com/maykbrito">
          <div class="tags">
            <p></p>
            <span>/maykbrito</span>
          </div>
        </a>
        </td>

        <td class="repos">123</td>
        <td class="followers">1234</td>
        <td> <button class="remove">remover</button> </td>
      </tr>
    `
		tr.className = 'user'

		return tr
	}

	noFavorites() {
		const noFavs = document.querySelector('.no-favorites')
		if (this.entries.length <= 0) {
			noFavs.classList.remove('hide')
		} else {
			noFavs.classList.add('hide')
		}
	}
}
