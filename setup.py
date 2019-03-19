from setuptools import setup


def readme():
    with open('README.md') as f:
        return f.read()

setup(name='dynamic_map',
      version='0.1',
      description='Creating interactive map for US Country with All regions data..',
      long_description=readme(),
      url='https://github.com/an-truptipagare/interactive_map',
      author='Application Nexus',
      author_email='demo@example.com',
      license='MIT',
      packages=['dynamic_map'],
      zip_safe=False)
