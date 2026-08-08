import { Blog, User } from '../models/index.js';

export const createBlog = async (req, res) => {
  try {
    const { title, content, slug, image, is_published } = req.body;
    
    const blog = await Blog.create({
      title,
      content,
      slug,
      image,
      is_published,
      author_id: req.user.id // token-dən gəlir
    });
    
    res.status(201).json(blog);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Bu slug artıq mövcuddur.' });
    }
    res.status(500).json({ error: 'Blog yaradılarkən xəta baş verdi', details: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const { is_published } = req.query;
    const where = {};
    if (is_published !== undefined) {
      where.is_published = is_published === 'true' || is_published === true;
    }

    const blogs = await Blog.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Blogları gətirərkən xəta baş verdi', details: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({
      where: { slug },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog tapılmadı' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Blog gətirərkən xəta baş verdi', details: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog tapılmadı' });
    }
    
    await blog.update(req.body);
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Blog yenilənərkən xəta baş verdi', details: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog tapılmadı' });
    }
    
    await blog.destroy();
    res.json({ message: 'Blog uğurla silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Blog silinərkən xəta baş verdi', details: error.message });
  }
};
