fetch("https://api.github.com/gists", {
    "method": "POST",
    "headers": {
        "authorization": "token d7f903aa51819b31d0d57412dab8cb4be5cc6469",
        "content-type": "application/json"
    },
    "body": {
        "description": "Hello World Examples",
        "public": false,
        "files": {
            "hello_world.rb": {
                "content": "class HelloWorld\n   def initialize(name)\n      @name = name.capitalize\n   end\n   def sayHi\n      puts \"Hello !\"\n   end\nend\n\nhello = HelloWorld.new(\"World\")\nhello.sayHi"
            },
            "hello_world.py": {
                "content": "class HelloWorld:\n\n    def __init__(self, name):\n        self.name = name.capitalize()\n       \n    def sayHi(self):\n        print \"Hello \" + self.name + \"!\"\n\nhello = HelloWorld(\"world\")\nhello.sayHi()"
            },
            "hello_world_ruby.txt": {
                "content": "Run `ruby hello_world.rb` to print Hello World"
            },
            "hello_world_python.txt": {
                "content": "Run `python hello_world.py` to print Hello World"
            }
        }
    }
})
.then(response => {
console.log(response);
})
.catch(err => {
console.log(err);
});